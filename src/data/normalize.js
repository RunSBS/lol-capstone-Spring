// Riot ID 입력 정규화 유틸
// - 입력 예시: "hide on bush #kr1" → 출력: "hide on bush#KR1"
// - 태그가 없으면 닉네임만 반환
export function normalizeRiotIdQuery(raw) {
  const s = String(raw || '')
  if (!s.trim()) return ''
  const parts = s.split('#')
  const name = parts[0].trim()
  const tag = (parts[1] || '').trim()
  return tag ? `${name}#${tag.toUpperCase()}` : name
}


