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
  const idNum = Number(itemId);
  if (!Number.isFinite(idNum) || idNum <= 0) return ''; // 빈 슬롯 처리
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/item/${idNum}.png`;
}

const spellMapCache = new Map();      // key: `${ver}|${lang}` -> Map<number, spellKey>
const runePerkMapByVer  = new Map();  // ver -> Map<perkId, iconPath>
const runeStyleMapByVer = new Map();  // ver -> Map<styleId, iconPath>

export const PLACEHOLDER_IMG = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const STYLE_720X_BY_ID = {
  8000: 'perk-images/Styles/7201_Precision.png',   // Precision
  8100: 'perk-images/Styles/7200_Domination.png',  // Domination
  8200: 'perk-images/Styles/7203_Sorcery.png',     // Sorcery
  8300: 'perk-images/Styles/7202_Inspiration.png', // Inspiration (레거시 Whimsy 명칭 대응은 아래에서 처리)
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
      if (Number.isFinite(num)) map.set(num, sp?.id);
    });
    spellMapCache.set(cacheKey, map);
    return map;
  } catch (e) {
    console.warn('Failed to load spell map, using fallback:', e);
    return new Map();
  }
}

// ===== 룬 아이콘 =====
export function tryBuildRuneIconUrl(perkId, fallback = PLACEHOLDER_IMG) {
  const id = Number(perkId);
  if (!Number.isFinite(id)) return fallback;
  // 1) runesReforged의 perk.icon 경로 우선 사용 (CDN AccessDenied 회피)
  const maps = Array.from(runePerkMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }
  // 2) CommunityDragon 고정 경로 폴백
  const tier = Math.floor(id / 1000);
  const slot = Math.floor((id % 1000) / 100);
  const rune = id % 100;
  const path = `perk-images/Styles/${tier}${slot}${rune.toString().padStart(2, '0')}.png`;
  return `https://ddragon.leagueoflegends.com/cdn/img/${path}`;
}

export function buildRuneStyleIcon(styleId, fallback = PLACEHOLDER_IMG) {
  const id = Number(styleId);
  if (!Number.isFinite(id)) return fallback;
  // 1) runesReforged의 style.icon 경로 우선 사용
  const maps = Array.from(runeStyleMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }
  // 2) 720x 고정 경로 폴백
  const path720 = STYLE_720X_BY_ID[id];
  if (path720) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${path720}`;
  }
  return fallback;
}

// perkId로부터 styleId 유추 (perkId의 천의 자리수)
export function inferStyleIdFromPerkId(perkId) {
  const id = Number(perkId);
  if (!Number.isFinite(id)) return null;
  const tier = Math.floor(id / 1000);
  return tier * 100;
}

// 룬 아이콘/스타일 아이콘 매핑 로더
export async function loadRuneMap(version, lang = 'en_US') {
  const safeVer = version || '15.18.1';
  const cacheKey = `${safeVer}|${lang}`;
  if (runePerkMapByVer.has(cacheKey) && runeStyleMapByVer.has(cacheKey)) {
    return { perk: runePerkMapByVer.get(cacheKey), style: runeStyleMapByVer.get(cacheKey) };
  }
  try {
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${safeVer}/data/${lang}/runesReforged.json`);
    if (!res.ok) throw new Error('rune json fetch failed');
    const json = await res.json();
    const perkMap = new Map();
    const styleMap = new Map();
    json.forEach((tree) => {
      const styleId = tree?.id;
      if (Number.isFinite(styleId)) {
        styleMap.set(styleId, tree?.icon);
        tree?.slots?.forEach((slot) => {
          slot?.runes?.forEach((rune) => {
            const perkId = rune?.id;
            if (Number.isFinite(perkId)) {
              perkMap.set(perkId, rune?.icon);
            }
          });
        });
      }
    });
    runePerkMapByVer.set(cacheKey, perkMap);
    runeStyleMapByVer.set(cacheKey, styleMap);
    return { perk: perkMap, style: styleMap };
  } catch (e) {
    console.warn('Failed to load rune map, using fallback:', e);
    return { perk: new Map(), style: new Map() };
  }
}

// ===== 랭크 엠블렘 =====
export function buildRankEmblemUrl(tier) {
  const t = (tier || 'UNRANKED').toLowerCase();
  return `https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/${t}.png`;
}

export function buildOpggEmblemFallbackUrl(tier, rank) {
  const t = (tier || 'UNRANKED').toLowerCase();
  const r = (rank || '').toLowerCase();
  return `https://s-lol-web.op.gg/images/icon/icon-${t}-${r}.png`;
}

// ===== 스티커/이모트 =====
export function buildStickerUrl(stickerId, size = 'small') {
  return `https://ddragon.leagueoflegends.com/cdn/img/sticker/${stickerId}_${size}.png`;
}

export async function loadStickers() {
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/img/sticker/sticker.json');
    if (!res.ok) throw new Error('sticker json fetch failed');
    const json = await res.json();
    return json?.data || {};
  } catch (error) {
    console.warn('Failed to load stickers, using fallback data:', error);
    return {
      'sticker_1': { name: 'Default Sticker', image: 'sticker_1_small.png' },
      'sticker_2': { name: 'Happy Sticker', image: 'sticker_2_small.png' },
      'sticker_3': { name: 'Sad Sticker', image: 'sticker_3_small.png' }
    };
  }
}

export async function loadEmotes() {
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/img/emote/emote.json');
    if (!res.ok) throw new Error('emote json fetch failed');
    const json = await res.json();
    return json?.data || {};
  } catch (err) {
    console.warn('Failed to load emotes, fallback to empty list:', err);
    return {};
  }
}

// 정적 720x 스타일 아이콘 URL 반환 (styleId: 8000~8400)
export function getStyleStaticIcon(styleId, fallback = PLACEHOLDER_IMG) {
  const id = Number(styleId);
  if (!Number.isFinite(id)) return fallback;
  // 1) runesReforged의 style.icon 경로 우선 사용 (CDN AccessDenied 회피)
  const maps = Array.from(runeStyleMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }
  // 2) 720x 고정 경로 폴백
  const path720 = STYLE_720X_BY_ID[id];
  if (path720) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${path720}`;
  }
  try { console.debug('[DEBUG_LOG] Unknown styleId for icon:', id) } catch {}
  // 3) 최종 폴백
  return fallback;
}