// Data Dragon / CommunityDragon ?„ì´ì½?URL ? í‹¸
// ?¬ìš© ê·œì¹™
// - version(ddVer): fetchDDragonVersion() ë¡œë“œ ê²°ê³¼ë¥?ê·¸ë?ë¡??„ë‹¬?©ë‹ˆ?? (?? "15.18.1")
// - championName: Riot ì±”í”¼???ë¬¸ ??(?? "Ahri"). ê³µë°±/?¹ìˆ˜ë¬¸ì ?†ëŠ” ?œì? ?¤ë? ê¸°ë??©ë‹ˆ??
// - itemId: ?•ìˆ˜ ?„ì´??ID. Match-V5 participants.item0~item6 ê·¸ë?ë¡??¬ìš© ê°€?¥í•©?ˆë‹¤.
// - spellId / perkId: ?«ì ID. ?¤í /ë£¬ì? ?Œì¼ëª…ì´ ??ë¬¸ì??ê¸°ë°˜?´ë¼ ì¶”ê? ë§¤í•‘???„ìš”?©ë‹ˆ??
export function buildChampionSquareUrl(version, championName) {
  const safeVer = version || '15.18.1';
  const key = championName || 'Aatrox';
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/champion/${key}.png`;
}
export function buildItemIconUrl(version, itemId) {
  const safeVer = version || '15.18.1';
  const idNum = Number(itemId);
  if (!Number.isFinite(idNum) || idNum <= 0) return ''; // ë¹??¬ë¡¯ ì²˜ë¦¬
  return `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/item/${idNum}.png`;
}
// ===== ìºì‹œ =====
const spellMapCache = new Map();      // key: `${ver}|${lang}` -> Map<number, spellKey>
const runePerkMapByVer  = new Map();  // ver -> Map<perkId, iconPath>
const runeStyleMapByVer = new Map();  // ver -> Map<styleId, iconPath>
// ===== ?ìˆ˜ =====
export const PLACEHOLDER_IMG = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
// 720x(?ˆê±°?? ?¤í????„ì´ì½?ê³ ì • ë§¤í•‘ (OP.GG ?¤í???ê²½ë¡œ)
const STYLE_720X_BY_ID = {
  8000: 'perk-images/Styles/7201_Precision.png',   // Precision
  8100: 'perk-images/Styles/7200_Domination.png',  // Domination
  8200: 'perk-images/Styles/7203_Sorcery.png',     // Sorcery
  8300: 'perk-images/Styles/7202_Inspiration.png', // Inspiration (?ˆê±°??Whimsy ëª…ì¹­ ?€?‘ì? ?„ë˜?ì„œ ì²˜ë¦¬)
  8400: 'perk-images/Styles/7204_Resolve.png',     // Resolve
};
// ===== ?¤í  ?„ì´ì½?=====
export function tryBuildSummonerSpellIconUrl(version, spellId, fallback = PLACEHOLDER_IMG, lang = 'en_US') {
  const safeVer = version || '15.18.1';
  const cacheKey = `${safeVer}|${lang}`;
  const map = spellMapCache.get(cacheKey);
  const key = map?.get(Number(spellId));
  return key ? `https://ddragon.leagueoflegends.com/cdn/${safeVer}/img/spell/${key}.png` : fallback;
}
// ?¤í  ë§¤í•‘ ë¡œë”: summonerId(number) -> spell key(string id)
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
// ===== ë£??¼í¬/?¤í??? ?„ì´ì½?=====
// ê°œë³„ ?¼í¬ ?„ì´ì½? runesReforged.json??r.icon??ê·¸ë?ë¡??¬ìš© (?? perk-images/Styles/Precision/Conqueror/Conqueror.png)
export function tryBuildRuneIconUrl(perkId, fallback = PLACEHOLDER_IMG) {
  if (perkId == null) return fallback;
  const id = Number(perkId);
  // 1) loadRuneMap()ê°€ ì±„ìš´ runePerkMapByVer?ì„œ ì°¾ê¸°
  const maps = Array.from(runePerkMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }
  // 2) ?˜ë“œì½”ë”© ?´ë°±: ?¹ì • ?¤ìŠ¤???¹íˆ Sorcery)??ê°„í—?ìœ¼ë¡?ë§¤í•‘?˜ì? ?Šì„ ??
  const HARDCODED_PERK_ICON_BY_ID = {
    // Sorcery (ë§ˆë²•)
    8214: 'perk-images/Styles/Sorcery/SummonAery/SummonAery.png', // ì½©ì½©???Œí™˜
    8229: 'perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png', // ? ë¹„ë¡œìš´ ? ì„±
    8230: 'perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png', // ?œì…
    // Domination (ì§€ë°? ?€???¤ìŠ¤?¤ë“¤(?ˆë¹„)
    8112: 'perk-images/Styles/Domination/Electrocute/Electrocute.png',
    8128: 'perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png',
    9923: 'perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png',
    // Precision (?•ë?) ?€???¤ìŠ¤?¤ë“¤(?ˆë¹„)
    8005: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
    8008: 'perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png',
    8021: 'perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png',
    8010: 'perk-images/Styles/Precision/Conqueror/Conqueror.png',
    // Resolve (ê²°ì˜) ?€???¤ìŠ¤?¤ë“¤(?ˆë¹„)
    8437: 'perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
    8439: 'perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
    8465: 'perk-images/Styles/Resolve/Guardian/Guardian.png',
    // Inspiration (?ê°) ?€???¤ìŠ¤?¤ë“¤(?ˆë¹„)
    8351: 'perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png',
    8360: 'perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
    8369: 'perk-images/Styles/Domination/FirstStrike/FirstStrike.png', // First Strikeê°€ Domination ê²½ë¡œ???„ì¹˜?˜ì?ë§??ê° ê³„ì—´ ?¤ìŠ¤??
  };
  if (HARDCODED_PERK_ICON_BY_ID[id]) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${HARDCODED_PERK_ICON_BY_ID[id]}`;
  }
  try {
    console.debug('[DEBUG_LOG] Rune icon not resolved for perkId=', id);
  } catch {}
  return fallback;
}
// ?¤í????¸ë¦¬) ?„ì´ì½? 720x ê³ ì • ë§¤í•‘ ??runesReforged.style.icon ??placeholder
export function buildRuneStyleIcon(styleId, fallback = PLACEHOLDER_IMG) {
  const id = Number(styleId);
  if (!Number.isFinite(id)) return fallback;
  // 1) 720x ê³ ì • ë§¤í•‘ ?°ì„ 
  const path720 = STYLE_720X_BY_ID[id];
  if (path720) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${path720}`;
  }
  // 2) runesReforged.json?ì„œ ë¡œë“œ??style.icon ê²½ë¡œ ?´ë°±
  const maps = Array.from(runeStyleMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id);
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`;
  }
  // 3) ìµœì¢… ?´ë°±
  return fallback;
}
// ë³´ì¡° ?¤í???ì¶”ë¡ : perkId???„ì´ì½?ê²½ë¡œ???¬í•¨???¤í????´ë¦„?¼ë¡œ ?¤í???ID ? ì¶”
export function inferStyleIdFromPerkId(perkId) {
  if (perkId == null) return null;
  const id = Number(perkId);
  if (!Number.isFinite(id)) return null;
  const maps = Array.from(runePerkMapByVer.values());
  const rel = maps.find((m) => m.has(id))?.get(id) || '';
  const s = String(rel);
  if (!s) return null;
  // ê²½ë¡œ ?? perk-images/Styles/Precision/Conqueror/Conqueror.png
  if (s.includes('/Precision/')) return 8000;
  if (s.includes('/Domination/')) return 8100;
  if (s.includes('/Sorcery/')) return 8200;
  if (s.includes('/Inspiration/')) return 8300;
  if (s.includes('/Resolve/')) return 8400;
  const lower = s.toLowerCase();
  if (lower.includes('/precision/')) return 8000;
  if (lower.includes('/domination/')) return 8100;
  if (lower.includes('/sorcery/')) return 8200;
  if (lower.includes('/inspiration/')) return 8300;
  if (lower.includes('/resolve/')) return 8400;
  return null;
}
// ë£??„ì´ì½??¤í????„ì´ì½?ë§¤í•‘ ë¡œë”
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
// ===== ??¬ ? ë¸”??=====
// ??¬ ? ë¸”??URL ë¹Œë”(CommunityDragon)
export function buildRankEmblemUrl(tier) {
  const t = String(tier || 'GOLD').toLowerCase();
  return `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${t}.png`;
}
// OPGG ? ë¸”???´ë°± URL (ì»¤ë??ˆí‹°?œë˜ê³?onError ??1???¬ìš©)
export function buildOpggEmblemFallbackUrl(tier, rank) {
  const t = String(tier || 'GOLD').toLowerCase();
  const roman = String(rank || '').toUpperCase();
  const map = { I: 1, II: 2, III: 3, IV: 4 };
  const n = map[roman] || 1;
  return `https://opgg-static.akamaized.net/images/medals/${t}_${n}.png?image=q_auto,f_webp,w_144`;
}
// ===== ?¤í‹°ì»?ê°ì •?œí˜„) =====
export function buildStickerUrl(stickerId, size = 'small') {
  const sizeMap = { small: '32x32', medium: '64x64', large: '128x128' };
  const sizeStr = sizeMap[size] || '32x32';
  return `https://raw.communitydragon.org/latest/game/assets/ux/emotes/${stickerId}.png`;
}
export async function loadStickers() {
  try {
    const res = await fetch('https://raw.communitydragon.org/latest/game/data/ux/emotes/emotes.bin.json');
    if (!res.ok) throw new Error('Failed to fetch stickers');
    await res.json(); // ?¤ì œ ?Œì‹±?€ ?„ìš” ???•ì¥
    // ?°ëª¨ ?°ì´??(?¤ì„œë¹„ìŠ¤?ì„  ??JSON???Œì‹±)
    return [
      { id: 'emote_01', name: 'ê¸°ì¨', description: 'ê¸°ìœ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: buildStickerUrl('emote_01') },
      { id: 'emote_02', name: '?¬í””', description: '?¬í”ˆ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: buildStickerUrl('emote_02') },
      { id: 'emote_03', name: '?”ë‚¨', description: '?”ë‚œ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: buildStickerUrl('emote_03') },
      { id: 'emote_04', name: '?€??, description: '?€?€ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: buildStickerUrl('emote_04') },
      { id: 'emote_05', name: '?¬ë‘', description: '?¬ë‘ ê°ì •?œí˜„', price: 100, category: 'emotion', image: buildStickerUrl('emote_05') },
      { id: 'emote_06', name: '?ƒìŒ', description: '?ƒëŠ” ê°ì •?œí˜„', price: 75,  category: 'emotion', image: buildStickerUrl('emote_06') },
      { id: 'emote_07', name: '?¹ë¦¬', description: '?¹ë¦¬ ê°ì •?œí˜„', price: 150, category: 'victory', image: buildStickerUrl('emote_07') },
      { id: 'emote_08', name: '?¨ë°°', description: '?¨ë°° ê°ì •?œí˜„', price: 100, category: 'defeat',  image: buildStickerUrl('emote_08') },
    ];
  } catch (error) {
    console.warn('Failed to load stickers, using fallback data:', error);
    // ?´ë°± ?°ëª¨ ?°ì´??
    return [
      { id: 'emote_01', name: 'ê¸°ì¨', description: 'ê¸°ìœ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png' },
      { id: 'emote_02', name: '?¬í””', description: '?¬í”ˆ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Yasuo.png' },
      { id: 'emote_03', name: '?”ë‚¨', description: '?”ë‚œ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Jinx.png' },
      { id: 'emote_04', name: '?€??, description: '?€?€ ê°ì •?œí˜„', price: 50,  category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lux.png' },
      { id: 'emote_05', name: '?¬ë‘', description: '?¬ë‘ ê°ì •?œí˜„', price: 100, category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Thresh.png' },
      { id: 'emote_06', name: '?ƒìŒ', description: '?ƒëŠ” ê°ì •?œí˜„', price: 75,  category: 'emotion', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Zed.png' },
      { id: 'emote_07', name: '?¹ë¦¬', description: '?¹ë¦¬ ê°ì •?œí˜„', price: 150, category: 'victory', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Darius.png' },
      { id: 'emote_08', name: '?¨ë°°', description: '?¨ë°° ê°ì •?œí˜„', price: 100, category: 'defeat',  image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png' },
    ];
  }
}
// CommunityDragon ê¸°ë°˜ ê°ì •?œí˜„(?ëª¨?? ëª©ë¡ ë¡œë”
// ì°¸ê³ : latest/plugins/rcp-be-lol-game-data/global/default/v1/emotes.json
export async function loadEmotes() {
  try {
    const res = await fetch(
        'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/emotes.json'
    );
    if (!res.ok) throw new Error('Failed to fetch emotes');
    const arr = await res.json();
    const toImgUrl = (inventoryIcon) => {
      if (!inventoryIcon) return PLACEHOLDER_IMG;
      const norm = String(inventoryIcon).replace(/^\/+/, '');
      if (/^plugins\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/${norm}`;
      }
      if (/^lol-game-data\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${norm}`;
      }
      if (/^game\//i.test(norm)) {
        return `https://raw.communitydragon.org/latest/${norm}`;
      }
      return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${norm}`;
    };
    const emotes = (arr || [])
        .filter((e) => e && (e.inventoryIcon || e.name))
        .map((e) => ({
          id: `emote_${e.id}`,
          name: e.name || `Emote ${e.id}`,
          description: 'ê³µì‹ ê°ì •?œí˜„(?ëª¨??',
          price: 75,
          category: 'emote',
          image: toImgUrl(e.inventoryIcon),
        }));
    return emotes;
  } catch (err) {
    console.warn('Failed to load emotes, fallback to empty list:', err);
    return [];
  }
// ?•ì  720x ?¤í????„ì´ì½?URL ë°˜í™˜ (styleId: 8000~8400)
export function getStyleStaticIcon(styleId, fallback = PLACEHOLDER_IMG) {
  const id = Number(styleId)
  if (!Number.isFinite(id)) return fallback
  // 1) runesReforged??style.icon ê²½ë¡œ ?°ì„  ?¬ìš© (CDN AccessDenied ?Œí”¼)
  const maps = Array.from(runeStyleMapByVer.values())
  const rel = maps.find((m) => m.has(id))?.get(id)
  if (rel) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${rel}`
  }
  // 2) 720x ê³ ì • ê²½ë¡œ ?´ë°±
  const path720 = STYLE_720X_BY_ID[id]
  if (path720) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${path720}`
  }
  try { console.debug('[DEBUG_LOG] Unknown styleId for icon:', id) } catch {}
  // 3) ìµœì¢… ?´ë°±
  return fallback
}

