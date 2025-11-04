// 백엔드 계약에 맞춘 API 래퍼
// 주의: 호출 전 URL 인코딩 필수

export async function fetchSummonerView(gameName, tagLine) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`/summoner/view/${g}/${t}`, { method: 'GET', signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET view failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch (e) {
    // Backend unavailable → throw error
    throw e
  }
}

export async function fetchRecentMatches(gameName, tagLine, count, queueId = null) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  const queueParam = queueId != null ? `&queueId=${queueId}` : ''
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(`/match/recent?gameName=${g}&tagLine=${t}&count=${count}${queueParam}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET recent failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return empty array
    return []
  }
}

// 자동완성 검색 API
export async function fetchAutocompleteKeywords(query) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 타임아웃 2초 → 15초로 증가 (KR1~KR10 검색 시간 고려)
    const res = await fetch(`/summoner/autocomplete?q=${encodeURIComponent(query)}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      // Rate limit 에러(429)인 경우 특별 처리
      if (res.status === 429) {
        throw new Error(`RATE_LIMIT: ${text || 'API 요청 한도 초과'}`)
      }
      throw new Error(`GET autocomplete failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch (error) {
    // Rate limit 에러인 경우 특별 처리 (에러 전파)
    if (error?.message?.includes('RATE_LIMIT') || error?.message?.includes('429')) {
      throw error // Rate limit 에러는 재전파하여 UI에서 처리할 수 있도록
    }
    // Backend unavailable 또는 다른 에러 → return empty array
    return []
  }
}

// export async function fetchMatchDetail(matchId, includeTimeline = false) {
//   const id = encodeURIComponent(matchId)
//   const res = await fetch(`/match/${id}/detail?includeTimeline=${includeTimeline ? 'true' : 'false'}`)
//   if (!res.ok) {
//     const text = await safeText(res)
//     throw new Error(`GET detail failed: ${res.status} ${text}`)
//   }
//   return res.json()
// }

async function safeText(res) {
  try { return await res.text() } catch { return '' }
}

// 매치 상세 정보 조회 API
export async function fetchMatchDetail(matchId, useCache = true) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    // Backend path is /match/detail/{matchId}
    const res = await fetch(`/match/detail/${encodeURIComponent(matchId)}?useCache=${useCache}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET match detail failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return null
    return null
  }
}

// 소환사 숙련도 조회 API, MasteryCard에서 사용
export async function fetchChampionMastery(gameName, tagLine) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/summoner/mastery/${g}/${t}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET mastery failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return empty array
    return []
  }
}

// 함께 플레이한 소환사 조회 API, PlayedWithCard에서 사용
export async function fetchPlayedWith(gameName, tagLine) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/summoner/played-with/${g}/${t}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET played-with failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return empty array
    return []
  }
}

// 최근 N게임 포지션 데이터 조회 API, RecentGamesSummary에서 사용
export async function fetchPositions(gameName, tagLine, count = 20) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`/summoner/positions/${g}/${t}?count=${count}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET positions failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return empty array
    return []
  }
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


