// 프론트엔드 아이템 ID와 백엔드 itemCode 매핑

export const BORDER_ITEM_CODES = {
  default: "border_default",
  gold: "border_gold",
  silver: "border_silver",
  rainbow: "border_rainbow",
  diamond: "border_diamond",
  fire: "border_fire",
  ice: "border_ice",
  lightning: "border_lightning"
};

export const BANNER_ITEM_CODES = {
  default: "banner_default",
  ahri: "banner_ahri",
  yasuo: "banner_yasuo",
  jinx: "banner_jinx",
  thresh: "banner_thresh",
  zed: "banner_zed",
  lux: "banner_lux",
  darius: "banner_darius"
};

// 스티커 ID를 itemCode로 변환
export function getStickerItemCode(stickerId) {
  // sticker_champion_Ahri 형식
  if (stickerId.startsWith('champion_')) {
    const championName = stickerId.replace('champion_', '');
    return `sticker_champion_${championName}`;
  }
  
  // sticker_item_1001 형식
  if (stickerId.startsWith('item_')) {
    const itemId = stickerId.replace('item_', '');
    return `sticker_item_${itemId}`;
  }
  
  // sticker_rune_xxx 형식
  if (stickerId.startsWith('rune_')) {
    return `sticker_rune_${stickerId.replace('rune_', '')}`;
  }
  
  // sticker_style_xxx 형식 (룬 스타일)
  if (stickerId.startsWith('style_')) {
    return `sticker_style_${stickerId.replace('style_', '')}`;
  }
  
  // 기본적으로 그대로 반환
  return `sticker_${stickerId}`;
}

// itemCode를 프론트엔드 ID로 변환 (역변환)
export function getFrontendIdFromItemCode(itemCode) {
  if (itemCode.startsWith('border_')) {
    return itemCode.replace('border_', '');
  }
  
  if (itemCode.startsWith('banner_')) {
    return itemCode.replace('banner_', '');
  }
  
  if (itemCode.startsWith('sticker_champion_')) {
    return `champion_${itemCode.replace('sticker_champion_', '')}`;
  }
  
  if (itemCode.startsWith('sticker_item_')) {
    return `item_${itemCode.replace('sticker_item_', '')}`;
  }
  
  if (itemCode.startsWith('sticker_rune_')) {
    return `rune_${itemCode.replace('sticker_rune_', '')}`;
  }
  
  if (itemCode.startsWith('sticker_style_')) {
    return `style_${itemCode.replace('sticker_style_', '')}`;
  }
  
  return itemCode;
}

