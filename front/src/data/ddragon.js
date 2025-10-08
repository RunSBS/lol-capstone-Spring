// Data Dragon / CommunityDragon 아이콘 URL 유틸

// 사용 규칙
// - version(ddVer): fetchDDragonVersion() 로드 결과를 그대로 전달합니다. (예: "15.18.1")
// - championName: Riot 챔피언 영문 키 (예: "Ahri"). 공백/특수문자 없는 표준 키를 기대합니다.
// - itemId: 정수 아이템 ID. Match-V5 participants.item0~item6 그대로 사용 가능합니다.
// - spellId / perkId: 숫자 ID. 스펠/룬은 파일명이 키 문자열 기반이라 추가 매핑이 필요합니다.

export function buildChampionSquareUrl(version, championName) {
  const safeVer = version || '15.18.1'
  const key = championName || 'Aatrox'
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/champion/${key}.png`
}

export function buildItemIconUrl(version, itemId) {
  const safeVer = version || '15.18.1'
  if (!itemId && itemId !== 0) return ''
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/item/${itemId}.png`
}

// 스펠/룬 매핑 캐시 (1회 로드)
const spellMapCache = new Map() // key: `${ver}|${lang}` value: Map<number, stringId>
const runeIconMapCache = new Map() // key: ver value: Map<number, iconPath>

// 스펠/룬은 숫자 ID→파일명 매핑이 필요합니다.
export const PLACEHOLDER_IMG = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

export function tryBuildSummonerSpellIconUrl(version, spellId, fallback = PLACEHOLDER_IMG, lang = 'en_US') {
  const safeVer = version || '15.18.1'
  const cacheKey = `${safeVer}|${lang}`
  const map = spellMapCache.get(cacheKey)
  const key = map?.get(Number(spellId))
  return key ? `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/spell/${key}.png` : fallback
}

export function tryBuildRuneIconUrl(perkId, fallback = PLACEHOLDER_IMG) {
  // Data Dragon의 runesReforged.json 아이콘 경로 사용 (버전 비종속 이미지 경로)
  const anyMap = Array.from(runeIconMapCache.values())[0]
  const iconPath = anyMap?.get(Number(perkId))
  return iconPath ? `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}` : fallback
}

// 스펠 매핑 로더: summonerId(number) -> spell key(string id)
export async function loadSpellMap(version, lang = 'en_US') {
  const safeVer = version || '15.18.1'
  const cacheKey = `${safeVer}|${lang}`
  if (spellMapCache.has(cacheKey)) return spellMapCache.get(cacheKey)
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${safeVer}/data/${lang}/summoner.json`)
    if (!res.ok) throw new Error('spell json fetch failed')
    const json = await res.json()
    const map = new Map()
    Object.values(json?.data || {}).forEach((sp) => {
      const num = Number(sp?.key)
      const id = sp?.id // e.g., SummonerFlash
      if (!Number.isNaN(num) && id) map.set(num, id)
    })
    spellMapCache.set(cacheKey, map)
    return map
  } catch {
    const map = new Map()
    spellMapCache.set(cacheKey, map)
    return map
  }
}

// 룬 아이콘 매핑 로더: perkId(number) -> iconPath(string)
export async function loadRuneMap(version, lang = 'en_US') {
  const safeVer = version || '15.18.1'
  if (runeIconMapCache.has(safeVer)) return runeIconMapCache.get(safeVer)
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${safeVer}/data/${lang}/runesReforged.json`)
    if (!res.ok) throw new Error('runes json fetch failed')
    const arr = await res.json()
    const map = new Map()
    ;(arr || []).forEach((style) => {
      (style?.slots || []).forEach((slot) => {
        (slot?.runes || []).forEach((r) => {
          if (typeof r?.id === 'number' && r?.icon) map.set(r.id, r.icon)
        })
      })
    })
    runeIconMapCache.set(safeVer, map)
    return map
  } catch {
    const map = new Map()
    runeIconMapCache.set(safeVer, map)
    return map
  }
}

// 랭크 엠블렘 URL 빌더(CommunityDragon)
export function buildRankEmblemUrl(tier) {
  const t = String(tier || 'GOLD').toLowerCase()
  return `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${t}.png`
}

// OPGG 엠블렘 폴백 URL (커뮤니티드래곤 onError 시 1회 사용)
export function buildOpggEmblemFallbackUrl(tier, rank) {
  const t = String(tier || 'GOLD').toLowerCase()
  const roman = String(rank || '').toUpperCase()
  const map = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 }
  const n = map[roman] || 1
  return `https://opgg-static.akamaized.net/images/medals/${t}_${n}.png?image=q_auto,f_webp,w_144`
}


