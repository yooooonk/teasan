'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.')
        return
      }
      router.push(from)
      router.refresh()
    } catch {
      setError('연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xs">
      <h1 className="text-xl font-semibold text-center text-gray-800 mb-2">
        티끌모아 태산
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">

      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F7A8B7] focus:ring-2 focus:ring-[#F7A8B7]/20 outline-none transition"
          autoFocus
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-white transition opacity-90 hover:opacity-100 disabled:opacity-60"
          style={{ backgroundColor: '#F7A8B7' }}
        >
          {loading ? '확인 중…' : '입장'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <Suspense fallback={<div className="text-gray-500">로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
