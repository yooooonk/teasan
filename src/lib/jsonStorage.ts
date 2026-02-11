import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src', 'data')

// 동시성 제어를 위한 간단한 락 메커니즘
const writeQueue = new Map<string, Promise<void>>()

/**
 * JSON 파일 읽기
 */
export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename)
  
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (error) {
    // 파일이 없으면 기본값 반환
    const nodeError = error as { code?: string }
    if (nodeError.code === 'ENOENT') {
      return {} as T
    }
    throw error
  }
}

/**
 * JSON 파일 쓰기 (동시성 제어 포함)
 */
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  
  // 디렉토리가 없으면 생성
  await fs.mkdir(DATA_DIR, { recursive: true })
  
  // 동일한 파일에 대한 이전 쓰기 작업이 있으면 대기
  const previousWrite = writeQueue.get(filename)
  if (previousWrite) {
    await previousWrite
  }
  
  // 새로운 쓰기 작업 생성
  const writePromise = (async () => {
    try {
      const jsonData = JSON.stringify(data, null, 2)
      await fs.writeFile(filePath, jsonData, 'utf-8')
    } finally {
      // 작업 완료 후 큐에서 제거
      writeQueue.delete(filename)
    }
  })()
  
  writeQueue.set(filename, writePromise)
  await writePromise
}

/**
 * 파일 존재 여부 확인
 */
export async function fileExists(filename: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, filename)
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

