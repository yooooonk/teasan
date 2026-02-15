/**
 * API/DB에서 오는 날짜를 사용자 로컬 기준 날짜(YYYY-MM-DD)로 변환.
 * UTC로 저장된 날짜가 한국 시간 기준으로 하루 밀리는 현상 방지.
 */
export function toLocalDateString(val: string | Date): string {
  const d = typeof val === 'string' ? new Date(val) : val
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
