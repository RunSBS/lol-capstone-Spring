// Data Dragon / CommunityDragon 아이콘 URL 유틸

// 사용 규칙
// - version(ddVer): fetchDDragonVersion() 로드 결과를 그대로 전달합니다. (예: "15.18.1")
// - championName: Riot 챔피언 영문 키 (예: "Ahri"). 공백/특수문자 없는 표준 키를 기대합니다.
// - itemId: 정수 아이템 ID. Match-V5 participants.item0~item6 그대로 사용 가능합니다.
// - spellId / perkId: 숫자 ID. 스펠/룬은 파일명이 키 문자열 기반이라 추가 매핑이 필요합니다.

export function buildChampionSquareUrl(version, championName) {
  const safeVer = version || '15.18.1';
  const key = championName || 'Aatrox';
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/champion/${key}.png`;
}

export function buildItemIconUrl(version, itemId) {
  const safeVer = version || '15.18.1';
  if (!itemId && itemId !== 0) return '';
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/item/${itemId}.png`;
}

// ===== 캐시 =====
const spellMapCache = new Map(); // key: `${ver}|${lang}` value: Map<number, stringId>
const runePerkMapByVer  = new Map(); // ver -> Map<perkId, iconPath>
const runeStyleMapByVer = new Map(); // ver -> Map<styleId, iconPath>

// ===== 상수 =====
export const PLACEHOLDER_IMG = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// 720x(레거시) 스타일 아이콘 고정 매핑 (OP.GG 스타일 경로)
const STYLE_720X_BY_ID = {
  8000: 'perk-images/Styles/7201_Precision.png',   // Precision
  8100: 'perk-images/Styles/7200_Domination.png',  // Domination
  8200: 'perk-images/Styles/7203_Sorcery.png',     // Sorcery
  8300: 'perk-images/Styles/7202_Whimsy.png',      // Inspiration (레거시 명칭 Whimsy)
  8400: 'perk-images/Styles/7204_Resolve.png',     // Resolve
};

// ===== 스펠 아이콘 =====
export function tryBuildSummonerSpellIconUrl(version, spellId, fallback = PLACEHOLDER_IMG, lang = 'en_US') {
  const safeVer = version || '15.18.1';
  const cacheKey = `${safeVer}|${lang}`;
  const map = spellMapCache.get(cacheKey);
  const key = map?.get(Number(spellId));
  return key ? `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/spell/${key}.png` : fallback;
}

// 스펠 매핑 로더: summonerId(number) -> spell key(string id)
export async function loadSpellMap(version, lang = 'en_US') {
  const safeVer = version || '15.18.1';
  const cacheKey = `${safeVer}|${lang}`;
  if (spellMapCache.has(cacheKey)) return spellMapCache.get(cacheKey);
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${safeVer}/data/${lang}/summoner.json`);
    if (!res.ok) throw new Error('spell json fetch failed');
    const json = await res.json();
    const map = new Map();
    Object.values(json?.data || {}).forEach((sp) => {
      const num = Number(sp?.key);
      const id = sp?.id; // e.g., SummonerFlash
      if (!Number.isNaN(num) && id) map.set(num, id);
    });
    spellMapCache.set(cacheKey, map);
    return map;
  } catch {
    const map = new Map();
    spellMapCache.set(cacheKey, map);
    return map;
  }
}

// ===== 룬(퍼크/스타일) 아이콘 =====

// 개별 퍼크 아이콘: runesReforged.json의 r.icon을 그대로 사용 (예: perk-images/Styles/Precision/Conqueror/Conqueror.png)
export function tryBuildRuneIconUrl(perkId, fallback = PLACEHOLDER_IMG) {
  if (perkId == null) return fallback;
  const id = Number(perkId);

  // loadRuneMap()가 채운 runePerkMapByVer에서 찾기
  const maps = Array.from(runePerkMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  return rel ? `https://ddragon.leagueoflegends.com/cdn/img/${rel}` : fallback;
}

// 스타일(트리) 아이콘: 720x 고정 매핑 → runesReforged.style.icon → placeholder
export function buildRuneStyleIcon(styleId, fallback = PLACEHOLDER_IMG) {
  const id = Number(styleId);
  if (!Number.isFinite(id)) return fallback;

  // 1) 720x 고정 매핑 우선
  const path720 = STYLE_720X_BY_ID[id];
  if (path720) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${path720}`;
  }

  // 2) runesReforged.json에서 로드된 style.icon 경로 폴백
  const maps = Array.from(runeStyleMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }

  // 3) 최종 폴백
  return fallback;
}

// 룬 아이콘/스타일 아이콘 매핑 로더
export async function loadRuneMap(version, lang = 'en_US') {
  const safeVer = version || '15.18.1';
  if (runePerkMapByVer.has(safeVer) && runeStyleMapByVer.has(safeVer)) {
    return { perk: runePerkMapByVer.get(safeVer), style: runeStyleMapByVer.get(safeVer) };
  }
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${safeVer}/data/${lang}/runesReforged.json`);
    if (!res.ok) throw new Error('runes json fetch failed');
    const arr = await res.json();

    const perkMap  = new Map(); // r.id -> r.icon
    const styleMap = new Map(); // style.id -> style.icon

    (arr || []).forEach((style) => {
      if (typeof style?.id === 'number' && style?.icon) {
        styleMap.set(style.id, style.icon);
      }
      (style?.slots || []).forEach((slot) => {
        (slot?.runes || []).forEach((r) => {
          if (typeof r?.id === 'number' && r?.icon) {
            perkMap.set(r.id, r.icon);
          }
        });
      });
    });

    runePerkMapByVer.set(safeVer, perkMap);
    runeStyleMapByVer.set(safeVer, styleMap);
    return { perk: perkMap, style: styleMap };
  } catch {
    const empty = new Map();
    runePerkMapByVer.set(safeVer, empty);
    runeStyleMapByVer.set(safeVer, empty);
    return { perk: empty, style: empty };
  }
}

// ===== 랭크 엠블렘 =====

// 랭크 엠블렘 URL 빌더(CommunityDragon)
export function buildRankEmblemUrl(tier) {
  const t = String(tier || 'GOLD').toLowerCase();
  return `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${t}.png`;
}

// OPGG 엠블렘 폴백 URL (커뮤니티드래곤 onError 시 1회 사용)
export function buildOpggEmblemFallbackUrl(tier, rank) {
  const t = String(tier || 'GOLD').toLowerCase();
  const roman = String(rank || '').toUpperCase();
  const map = { I: 1, II: 2, III: 3, IV: 4 };
  const n = map[roman] || 1;
  return `https://opgg-static.akamaized.net/images/medals/${t}_${n}.png?image=q_auto,f_webp,w_144`;
}
