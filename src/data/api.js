// 백엔드 계약에 맞춘 API 래퍼
// 주의: 호출 전 URL 인코딩 필수

export async function fetchSummonerView(gameName, tagLine) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  const res = await fetch(`/summoner/view/${g}/${t}`, { method: 'POST' })
  if (!res.ok) {
    const text = await safeText(res)
    throw new Error(`GET view failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function fetchRecentMatches(gameName, tagLine, count = 10) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  const res = await fetch(`/match/recent?gameName=${g}&tagLine=${t}&count=${count}`)
  if (!res.ok) {
    const text = await safeText(res)
    throw new Error(`GET recent failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function safeText(res) {
  try { return await res.text() } catch { return '' }
}

// Data Dragon 최신 버전 조회
export async function fetchDDragonVersion() {
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    if (!res.ok) return '15.18.1'
    const arr = await res.json()
    if (Array.isArray(arr) && arr.length > 0) return arr[0]
    return '15.18.1'
  } catch {
    return '15.18.1'
  }
}

// 자동완성 검색어 API 호출
export async function fetchAutocompleteKeywords(query) {
  try {
    const res = await fetch(`https://api.example.com/keywords?q=${encodeURIComponent(query)}`)
    if (!res.ok) {
      // 실제 API가 없으므로 목업 데이터 반환 (mockData.js에서 import)
      const { getFilteredAutocompleteData } = await import('./mockData.js')
      return getFilteredAutocompleteData(query)
    }
    return res.json()
  } catch {
    // 에러 시 목업 데이터 반환 (mockData.js에서 import)
    const { getFilteredAutocompleteData } = await import('./mockData.js')
    return getFilteredAutocompleteData(query)
  }
}


