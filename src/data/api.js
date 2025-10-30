// 백엔드 계약에 맞춘 API 래퍼
// 주의: 호출 전 URL 인코딩 필수

export async function fetchSummonerView(gameName, tagLine) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`/summoner/view/${g}/${t}`, { method: 'POST', signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET view failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch (e) {
    // Backend unavailable → fallback to mock view
    try {
      const { autocompleteMockData } = await import('./mockData.js')
      const ddVer = await fetchDDragonVersion().catch(() => '15.18.1')
      const candidate = autocompleteMockData.find(p =>
        p.name.toLowerCase() === String(gameName || '').toLowerCase() &&
        String(p.tag || '').toLowerCase() === String(tagLine || '').toLowerCase()
      ) || autocompleteMockData.find(p =>
        p.name.toLowerCase() === String(gameName || '').toLowerCase()
      ) || null

      const profileIconId = candidate?.profileIconId ?? 5465
      const summonerLevel = candidate?.level ?? 100
      const tier = candidate?.tier ?? 'Unranked'
      const rank = candidate?.rank ?? ''
      const lp = candidate?.lp ?? 0

      // Minimal mock view shape consumed by SummonerPage
      return {
        gameName,
        tagLine,
        puuid: `mock-puuid-0`, // 첫 번째 플레이어의 puuid와 일치하도록 설정
        profileIconId,
        summonerLevel,
        revisionDate: Date.now(),
        soloRanked: tier === 'Unranked' ? null : { tier, rank, leaguePoints: lp, wins: 0, losses: 0 },
        flexRanked: null,
        ddVer,
      }
    } catch {
      // Last resort minimal view
      return {
        gameName,
        tagLine,
        puuid: `mock-puuid-0`, // 첫 번째 플레이어의 puuid와 일치하도록 설정
        profileIconId: 5465,
        summonerLevel: 100,
        revisionDate: Date.now(),
        soloRanked: null,
        flexRanked: null,
        ddVer: '15.18.1',
      }
    }
  }
}

export async function fetchRecentMatches(gameName, tagLine, count) {
  const g = encodeURIComponent(gameName)
  const t = encodeURIComponent(tagLine)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(`/match/recent?gameName=${g}&tagLine=${t}&count=${count}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET recent failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return mock data (2개 매치만)
    try {
      const { mockMatchData } = await import('./mockData.js')
      return mockMatchData.slice(0, 2) // 2개 매치만 반환
    } catch {
      return []
    }
  }
}

// 자동완성 검색 API
export async function fetchAutocompleteKeywords(query) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`/summoner/autocomplete?q=${encodeURIComponent(query)}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const text = await safeText(res)
      throw new Error(`GET autocomplete failed: ${res.status} ${text}`)
    }
    return await res.json()
  } catch {
    // Backend unavailable → return mock autocomplete data
    try {
      const { autocompleteMockData } = await import('./mockData.js')
      const lowerQuery = query.toLowerCase()
      return autocompleteMockData.filter(player => 
        player.name.toLowerCase().includes(lowerQuery)
        // 태그 검색은 제거 - 이름으로만 검색하도록 수정
      ).slice(0, 5) // 최대 5개 결과
    } catch {
      return []
    }
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
    // Backend unavailable → return mock match detail
    try {
      const { mockMatchData } = await import('./mockData.js')
      return mockMatchData.find(match => match.matchId === matchId) || mockMatchData[0]
    } catch {
      return null
    }
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
    // Backend unavailable → return mock mastery data
    try {
      const { masteryData } = await import('./mockData.js')
      return masteryData.slice(0, 4) // 상위 4개만 반환
    } catch {
      return []
    }
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
    // Backend unavailable → return mock played-with data
    try {
      const { playedWithData } = await import('./mockData.js')
      return playedWithData.slice(0, 5) // 상위 5개만 반환
    } catch {
      return []
    }
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


