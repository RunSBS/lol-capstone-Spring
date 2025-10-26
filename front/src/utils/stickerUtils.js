// 스티커 인벤토리 관리 유틸리티

// 스티커 구매 처리
export function purchaseSticker(user, sticker, onUserUpdate) {
  if (user.tokens < sticker.price) {
    throw new Error('토큰이 부족합니다!');
  }

  const updatedUser = {
    ...user,
    tokens: user.tokens - sticker.price,
    stickers: {
      ...user.stickers,
      [sticker.id]: (user.stickers?.[sticker.id] || 0) + 1
    }
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 스티커 사용 처리 (배너에 부착)
export function useSticker(user, stickerId, onUserUpdate) {
  if (!user.stickers || !user.stickers[stickerId] || user.stickers[stickerId] <= 0) {
    throw new Error('보유하지 않은 스티커입니다!');
  }

  const updatedUser = {
    ...user,
    stickers: {
      ...user.stickers,
      [stickerId]: user.stickers[stickerId] - 1
    }
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 스티커 제거 처리 (배너에서 제거 시 인벤토리로 복구)
export function removeStickerFromBanner(user, stickerId, onUserUpdate) {
  const updatedUser = {
    ...user,
    stickers: {
      ...user.stickers,
      [stickerId]: (user.stickers?.[stickerId] || 0) + 1
    }
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 스티커 삭제 처리 (인벤토리에서 완전 삭제)
export function deleteSticker(user, stickerId, onUserUpdate) {
  if (!user.stickers || !user.stickers[stickerId] || user.stickers[stickerId] <= 0) {
    throw new Error('보유하지 않은 스티커입니다!');
  }

  const updatedUser = {
    ...user,
    stickers: {
      ...user.stickers,
      [stickerId]: user.stickers[stickerId] - 1
    }
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 배너에 스티커 추가
export function addStickerToBanner(user, sticker, onUserUpdate) {
  const updatedUser = {
    ...user,
    bannerStickers: [...(user.bannerStickers || []), sticker]
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 배너에서 스티커 제거
export function removeStickerFromBannerById(user, stickerId, onUserUpdate) {
  const updatedUser = {
    ...user,
    bannerStickers: (user.bannerStickers || []).filter(s => s.id !== stickerId)
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 배너 스티커 업데이트
export function updateBannerSticker(user, updatedSticker, onUserUpdate) {
  const updatedUser = {
    ...user,
    bannerStickers: (user.bannerStickers || []).map(s => 
      s.id === updatedSticker.id ? updatedSticker : s
    )
  };

  onUserUpdate(updatedUser);
  return updatedUser;
}

// 스티커 보유 수량 확인
export function getStickerCount(user, stickerId) {
  return user.stickers?.[stickerId] || 0;
}

// 보유한 스티커 목록 가져오기
export function getOwnedStickers(user) {
  if (!user.stickers) return [];
  
  return Object.entries(user.stickers)
    .filter(([_, count]) => count > 0)
    .map(([stickerId, count]) => ({ stickerId, count }));
}

// 스티커 정보 가져오기 (이름, 이미지 등)
export function getStickerInfo(stickerId, version = '15.18.1') {
  // 챔피언 스티커인지 확인
  if (stickerId.startsWith('champion_')) {
    const championName = stickerId.replace('champion_', '');
    return {
      name: championName,
      image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`,
      category: 'champion'
    };
  }
  
  // 아이템 스티커인지 확인
  if (stickerId.startsWith('item_')) {
    const itemId = stickerId.replace('item_', '');
    return {
      name: `아이템 ${itemId}`,
      image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`,
      category: 'item'
    };
  }
  
  // 기존 에모트 스티커
  const stickerMap = {
    'emote_01': { name: '기쁨', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png', category: 'emote' },
    'emote_02': { name: '슬픔', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Yasuo.png', category: 'emote' },
    'emote_03': { name: '화남', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Jinx.png', category: 'emote' },
    'emote_04': { name: '놀람', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lux.png', category: 'emote' },
    'emote_05': { name: '사랑', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Thresh.png', category: 'emote' },
    'emote_06': { name: '웃음', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Zed.png', category: 'emote' },
    'emote_07': { name: '승리', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Darius.png', category: 'emote' },
    'emote_08': { name: '패배', image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png', category: 'emote' }
  };
  
  return stickerMap[stickerId] || { name: stickerId, image: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png', category: 'unknown' };
}

// 스티커 상점 데이터 가져오기
export async function getStickerShopData() {
  try {
    const { loadStickers } = await import('../data/ddragon');
    return await loadStickers();
  } catch (error) {
    console.error('Failed to load sticker shop data:', error);
    return [];
  }
}
