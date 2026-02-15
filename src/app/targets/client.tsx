'use client'

import TargetForm from '@/components/targets/TargetForm'
import { AssetGroup } from '@/types/stock'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const assetGroups: AssetGroup[] = ['연금', '금', '해외주식', '국내주식']

export default function TargetsClient() {
  const router = useRouter()
  const [targets, setTargets] = useState<Record<AssetGroup, number>>({
    연금: 0,
    금: 0,
    해외주식: 0,
    국내주식: 0,
  })
  const [loading, setLoading] = useState(true)

  // 목표 로드 (원 단위를 만원으로 변환)
  const loadTargets = async () => {
    try {
      const res = await fetch('/api/targets')
      const data = await res.json()
      if (data.ok) {
        setTargets({
          연금: (data.data.연금 || 0) / 10000,
          금: (data.data.금 || 0) / 10000,
          해외주식: (data.data.해외주식 || 0) / 10000,
          국내주식: (data.data.국내주식 || 0) / 10000,
        })
      }
    } catch (error) {
      console.error('Error loading targets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTargets()
  }, [])

  // 필드 변경
  const handleChange = (assetGroup: AssetGroup, value: number) => {
    setTargets((prev) => ({
      ...prev,
      [assetGroup]: value,
    }))
  }

  // 저장 (만원을 원으로 변환)
  const handleSave = async () => {
    try {
      // 만원을 원으로 변환하여 저장
      const targetsInWon: Record<AssetGroup, number> = {
        연금: (targets.연금 || 0) * 10000,
        금: (targets.금 || 0) * 10000,
        해외주식: (targets.해외주식 || 0) * 10000,
        국내주식: (targets.국내주식 || 0) * 10000,
      }

      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetsInWon),
      })

      const data = await res.json()

      if (data.ok) {
        alert('저장되었습니다.')
        router.push('/')
      } else {
        alert(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error saving targets:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  // 취소
  const handleCancel = () => {
    router.push('/')
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        목표금액 입력
      </h1>

      <TargetForm
        targets={targets}
        onChange={handleChange}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

