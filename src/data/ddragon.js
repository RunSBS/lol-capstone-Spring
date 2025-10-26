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

// 챔피언 이미지 로딩 테스트 함수
export async function testChampionImage(version, championName) {
  const url = buildChampionSquareUrl(version, championName);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok ? url : null;
  } catch {
    return null;
  }
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

// 룬 데이터를 스티커 형태로 로드하는 함수
export async function loadRunes(version, lang = 'ko_KR') {
  try {
    console.log(`룬 데이터 로드 시도: ${version}, ${lang}`);
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/runesReforged.json`);
    if (!res.ok) throw new Error(`rune json fetch failed: ${res.status}`);
    const json = await res.json();
    
    console.log(`룬 데이터 로드 성공: ${json.length}개 스타일`);
    
    const runes = [];
    json.forEach((style) => {
      // 스타일 자체도 룬으로 추가
      runes.push({
        id: `style_${style.id}`,
        name: style.name,
        description: style.description,
        category: 'rune',
        image: `https://ddragon.leagueoflegends.com/cdn/img/${style.icon}`,
        fallbackImage: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png'
      });
      
      // 각 슬롯의 룬들 추가
      style.slots?.forEach((slot, slotIndex) => {
        slot.runes?.forEach((rune, runeIndex) => {
          runes.push({
            id: `rune_${rune.id}`,
            name: rune.name,
            description: rune.shortDesc || rune.longDesc,
            category: 'rune',
            image: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`,
            fallbackImage: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png'
          });
        });
      });
    });
    
    console.log(`총 룬 스티커 생성: ${runes.length}개`);
    return runes;
  } catch (error) {
    console.warn('Failed to load runes, using fallback data:', error);
    // 인기 룬들로 폴백
    const fallbackRunes = [
      { id: 'style_8000', name: '정밀', description: '정밀 룬 스타일' },
      { id: 'style_8100', name: '지배', description: '지배 룬 스타일' },
      { id: 'style_8200', name: '마법', description: '마법 룬 스타일' },
      { id: 'style_8300', name: '영감', description: '영감 룬 스타일' },
      { id: 'style_8400', name: '결의', description: '결의 룬 스타일' },
      { id: 'rune_8005', name: '치명적 속도', description: '공격 속도가 증가합니다' },
      { id: 'rune_8008', name: '정복자', description: '전투에서 지속적으로 강해집니다' },
      { id: 'rune_8021', name: '정밀한 공격', description: '연속 공격 시 추가 피해를 입힙니다' },
      { id: 'rune_8124', name: '포식자', description: '이동 속도가 증가합니다' },
      { id: 'rune_8128', name: '어둠의 수확', description: '적 처치 시 추가 피해를 입힙니다' },
      { id: 'rune_8214', name: '소환: 아이오니아의 의지', description: '스킬 가속이 증가합니다' },
      { id: 'rune_8229', name: '신비로운 유물', description: '아이템 효과가 강화됩니다' },
      { id: 'rune_8351', name: '빙결 강화', description: '빙결 효과가 강화됩니다' },
      { id: 'rune_8352', name: '신비로운 유물', description: '아이템 효과가 강화됩니다' },
      { id: 'rune_8437', name: '수호자', description: '아군을 보호합니다' },
      { id: 'rune_8446', name: '과다치유', description: '체력 회복이 강화됩니다' }
    ];
    
    console.log(`폴백 룬 데이터 사용: ${fallbackRunes.length}개`);
    
    return fallbackRunes.map(rune => ({
      ...rune,
      category: 'rune',
      image: `https://ddragon.leagueoflegends.com/cdn/img/${rune.id.includes('style') ? 'perk-images/Styles/' : 'perk-images/'}${rune.id.replace('style_', '').replace('rune_', '')}.png`,
      fallbackImage: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png'
    }));
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

// ===== 챔피언 데이터 =====
export async function loadChampions(version, lang = 'ko_KR') {
  try {
    console.log(`챔피언 데이터 로드 시도: ${version}, ${lang}`);
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/champion.json`);
    if (!res.ok) throw new Error(`champion json fetch failed: ${res.status}`);
    const json = await res.json();
    const champions = Object.values(json?.data || {});
    
    console.log(`챔피언 데이터 로드 성공: ${champions.length}개`);
    
    // 챔피언 데이터에 이미지 URL 추가
    return champions.map(champion => ({
      ...champion,
      imageUrl: buildChampionSquareUrl(version, champion.id)
    }));
  } catch (error) {
    console.warn('Failed to load champions, using fallback data:', error);
    // 인기 챔피언들로 폴백
    const fallbackChampions = [
      { id: 'Ahri', name: '아리', key: 'Ahri' },
      { id: 'Yasuo', name: '야스오', key: 'Yasuo' },
      { id: 'Jinx', name: '징크스', key: 'Jinx' },
      { id: 'Lux', name: '럭스', key: 'Lux' },
      { id: 'Thresh', name: '쓰레쉬', key: 'Thresh' },
      { id: 'Zed', name: '제드', key: 'Zed' },
      { id: 'Darius', name: '다리우스', key: 'Darius' },
      { id: 'Aatrox', name: '아트록스', key: 'Aatrox' },
      { id: 'Garen', name: '가렌', key: 'Garen' },
      { id: 'Katarina', name: '카타리나', key: 'Katarina' },
      { id: 'LeeSin', name: '리 신', key: 'LeeSin' },
      { id: 'Vayne', name: '베인', key: 'Vayne' },
      { id: 'MasterYi', name: '마스터 이', key: 'MasterYi' },
      { id: 'MissFortune', name: '미스 포츈', key: 'MissFortune' },
      { id: 'Caitlyn', name: '케이틀린', key: 'Caitlyn' },
      { id: 'Ashe', name: '애쉬', key: 'Ashe' },
      { id: 'Sona', name: '소나', key: 'Sona' },
      { id: 'Soraka', name: '소라카', key: 'Soraka' },
      { id: 'Janna', name: '잔나', key: 'Janna' },
      { id: 'Lulu', name: '룰루', key: 'Lulu' }
    ];
    
    console.log(`폴백 챔피언 데이터 사용: ${fallbackChampions.length}개`);
    
    return fallbackChampions.map(champion => ({
      ...champion,
      imageUrl: buildChampionSquareUrl(version, champion.id)
    }));
  }
}

// ===== 아이템 데이터 =====
export async function loadItems(version, lang = 'ko_KR') {
  try {
    console.log(`아이템 데이터 로드 시도: ${version}, ${lang}`);
    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/item.json`);
    if (!res.ok) throw new Error(`item json fetch failed: ${res.status}`);
    const json = await res.json();
    const items = Object.values(json?.data || {});
    
    console.log(`아이템 데이터 로드 성공: ${items.length}개`);
    
    // 아이템 데이터에 이미지 URL 추가
    return items.map(item => ({
      ...item,
      imageUrl: buildItemIconUrl(version, item.id)
    }));
  } catch (error) {
    console.warn('Failed to load items, using fallback data:', error);
    // 인기 아이템들로 폴백
    const fallbackItems = [
      { id: 3089, name: '라바돈의 죽음모자', gold: { total: 3600 } },
      { id: 1001, name: '장화', gold: { total: 300 } },
      { id: 3031, name: '무한의 대검', gold: { total: 3400 } },
      { id: 3071, name: '칠흑의 양날 도끼', gold: { total: 3200 } },
      { id: 3026, name: '수호 천사', gold: { total: 2800 } },
      { id: 3006, name: '광전사의 군화', gold: { total: 1100 } },
      { id: 3157, name: '존야의 모래시계', gold: { total: 3000 } },
      { id: 3036, name: '피바라기', gold: { total: 3200 } },
      { id: 3072, name: '피의 갑옷', gold: { total: 3000 } },
      { id: 3153, name: '블레이드 오브 더 루인드 킹', gold: { total: 3300 } },
      { id: 3003, name: '마법사의 신발', gold: { total: 1100 } },
      { id: 3035, name: '최후의 속삭임', gold: { total: 3000 } },
      { id: 3004, name: '마나 물약', gold: { total: 50 } },
      { id: 2003, name: '체력 물약', gold: { total: 50 } },
      { id: 1036, name: '롱소드', gold: { total: 350 } },
      { id: 1038, name: 'B.F. 대검', gold: { total: 1300 } },
      { id: 1037, name: 'Pickaxe', gold: { total: 875 } },
      { id: 1042, name: 'Dagger', gold: { total: 300 } },
      { id: 1055, name: 'Dorans Blade', gold: { total: 450 } },
      { id: 1056, name: 'Dorans Ring', gold: { total: 400 } }
    ];
    
    console.log(`폴백 아이템 데이터 사용: ${fallbackItems.length}개`);
    
    return fallbackItems.map(item => ({
      ...item,
      imageUrl: buildItemIconUrl(version, item.id)
    }));
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