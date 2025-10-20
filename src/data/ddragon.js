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

// ===== 스티커 (감정표현) =====

// 스티커 URL 빌더 (CommunityDragon 감정표현 에셋)
export function buildStickerUrl(stickerId, size = 'small') {
  const sizeMap = {
    small: '32x32',
    medium: '64x64', 
    large: '128x128'
  };
  const sizeStr = sizeMap[size] || '32x32';
  return `https://raw.communitydragon.org/latest/game/assets/ux/emotes/${stickerId}.png`;
}

// 스티커 데이터 로더 (감정표현 목록)
export async function loadStickers() {
  try {
    // CommunityDragon에서 감정표현 데이터 가져오기
    const res = await fetch('https://raw.communitydragon.org/latest/game/data/ux/emotes/emotes.bin.json');
    if (!res.ok) throw new Error('Failed to fetch stickers');
    const data = await res.json();
    
    // 스티커 목록 생성 (실제로는 더 복잡한 파싱이 필요할 수 있음)
    const stickers = [
      {
        id: 'emote_01',
        name: '기쁨',
        description: '기쁜 감정표현',
        price: 50,
        category: 'emotion',
        image: buildStickerUrl('emote_01')
      },
      {
        id: 'emote_02', 
        name: '슬픔',
        description: '슬픈 감정표현',
        price: 50,
        category: 'emotion',
        image: buildStickerUrl('emote_02')
      },
      {
        id: 'emote_03',
        name: '화남',
        description: '화난 감정표현', 
        price: 50,
        category: 'emotion',
        image: buildStickerUrl('emote_03')
      },
      {
        id: 'emote_04',
        name: '놀람',
        description: '놀란 감정표현',
        price: 50,
        category: 'emotion',
        image: buildStickerUrl('emote_04')
      },
      {
        id: 'emote_05',
        name: '사랑',
        description: '사랑 감정표현',
        price: 100,
        category: 'emotion',
        image: buildStickerUrl('emote_05')
      },
      {
        id: 'emote_06',
        name: '웃음',
        description: '웃는 감정표현',
        price: 75,
        category: 'emotion',
        image: buildStickerUrl('emote_06')
      },
      {
        id: 'emote_07',
        name: '승리',
        description: '승리 감정표현',
        price: 150,
        category: 'victory',
        image: buildStickerUrl('emote_07')
      },
      {
        id: 'emote_08',
        name: '패배',
        description: '패배 감정표현',
        price: 100,
        category: 'defeat',
        image: buildStickerUrl('emote_08')
      }
    ];
    
    return stickers;
  } catch (error) {
    console.warn('Failed to load stickers, using fallback data:', error);
    // 폴백 데이터 반환
    return [
      {
        id: 'emote_01',
        name: '기쁨',
        description: '기쁜 감정표현',
        price: 50,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png'
      },
      {
        id: 'emote_02', 
        name: '슬픔',
        description: '슬픈 감정표현',
        price: 50,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Yasuo.png'
      },
      {
        id: 'emote_03',
        name: '화남',
        description: '화난 감정표현', 
        price: 50,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Jinx.png'
      },
      {
        id: 'emote_04',
        name: '놀람',
        description: '놀란 감정표현',
        price: 50,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lux.png'
      },
      {
        id: 'emote_05',
        name: '사랑',
        description: '사랑 감정표현',
        price: 100,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Thresh.png'
      },
      {
        id: 'emote_06',
        name: '웃음',
        description: '웃는 감정표현',
        price: 75,
        category: 'emotion',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Zed.png'
      },
      {
        id: 'emote_07',
        name: '승리',
        description: '승리 감정표현',
        price: 150,
        category: 'victory',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Darius.png'
      },
      {
        id: 'emote_08',
        name: '패배',
        description: '패배 감정표현',
        price: 100,
        category: 'defeat',
        image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png'
      }
    ];
  }
}

// CommunityDragon 기반 감정표현(에모트) 목록 로더
// 참고: latest/plugins/rcp-be-lol-game-data/global/default/v1/emotes.json
export async function loadEmotes() {
  try {
    const res = await fetch(
      'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/emotes.json'
    );
    if (!res.ok) throw new Error('Failed to fetch emotes');
    const arr = await res.json();

    // arr: [{ id, name, inventoryIcon, ... }]
    // 이미지 경로는 inventoryIcon을 그대로 latest/plugins/... prefix와 결합
    const toImgUrl = (inventoryIcon) => {
      if (!inventoryIcon) return PLACEHOLDER_IMG;
      const norm = String(inventoryIcon).replace(/^\/+/, '');
      // 경우 1) 이미 plugins/rcp-be-lol-game-data/... 로 시작
      if (/^plugins\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/${norm}`;
      }
      // 경우 2) lol-game-data/ 로 시작 (일반적인 inventoryIcon)
      if (/^lol-game-data\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${norm}`;
      }
      // 그 외: game/assets/ux/emotes/ 같은 절대 게임 경로일 수 있음
      if (/^game\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/${norm}`;
      }
      // 마지막 폴백: 그대로 plugins 경로에 붙임
      return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${norm}`;
    };

    const emotes = (arr || [])
      .filter((e) => e && (e.inventoryIcon || e.name))
      .map((e) => ({
        id: `emote_${e.id}`,
        name: e.name || `Emote ${e.id}`,
        description: '공식 감정표현(에모트)',
        price: 75,
        category: 'emote',
        image: toImgUrl(e.inventoryIcon),
      }));

    return emotes;
  } catch (err) {
    console.warn('Failed to load emotes, fallback to empty list:', err);
    return [];
  }
}