import React, { useState, useEffect } from 'react';
import { loadStickers, loadEmotes, buildItemIconUrl } from '../../data/ddragon';
import { fetchDDragonVersion } from '../../data/api';

export default function StickerShop({ user, onStickerPurchase, onStickerInventory }) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStickerData();
  }, []);

  const loadStickerData = async () => {
    try {
      setLoading(true);
      const [stickerData, emoteData, ddVer] = await Promise.all([
        loadStickers(),
        loadEmotes(),
        fetchDDragonVersion()
      ]);
      // 에모트를 스티커 카탈로그에 병합 (중복 id는 유지 우선순위: 기존 stickerData)
      const existingIds = new Set(stickerData.map(s => s.id));
      const merged = stickerData.concat(emoteData.filter(e => !existingIds.has(e.id)));

      // Data Dragon 아이템 아이콘을 스티커 상품으로 추가 (라바돈 포함)
      const itemDefs = [
        { id: 3089, name: '라바돈의 죽음모자', price: 120 },
        { id: 1001, name: '장화', price: 20 },
        { id: 3031, name: '무한의 대검', price: 90 },
        { id: 3071, name: '칠흑의 양날 도끼', price: 85 },
        { id: 3026, name: '수호 천사', price: 95 }
      ];
      const itemStickers = itemDefs.map(def => ({
        id: `item_${def.id}`,
        name: def.name,
        description: '아이템 아이콘 스티커',
        price: def.price,
        category: 'item',
        image: buildItemIconUrl(ddVer, def.id)
      }));

      const finalList = merged
        .filter((_, idx) => true) // 유지 (마지막 상품 제거 요구에 대응: 별도 추가했던 CD 상품 제거됨)
        .concat(itemStickers);

      setStickers(finalList);
    } catch (error) {
      console.error('Failed to load stickers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStickerPurchase = (sticker) => {
    if (user.tokens < sticker.price) {
      alert('토큰이 부족합니다!');
      return;
    }

    if (confirm(`${sticker.name} 스티커를 ${sticker.price} 토큰으로 구매하시겠습니까?`)) {
      onStickerPurchase(sticker);
    }
  };

  const handleStickerUse = (sticker) => {
    onStickerInventory(sticker);
  };

  const displayStickers = stickers;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>스티커를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>스티커 상점</h3>
        {/* 토큰 정보 */}
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>보유 토큰: {user.tokens}개</strong>
        </div>
      </div>

      {/* 스티커 그리드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        {displayStickers.map((sticker) => {
          const isOwned = user.stickers && user.stickers[sticker.id] > 0;
          const ownedCount = user.stickers ? (user.stickers[sticker.id] || 0) : 0;
          
          return (
            <div 
              key={sticker.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#fff',
                position: 'relative'
              }}
            >
              {/* 스티커 이미지 */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <img 
                  src={sticker.image} 
                  alt={sticker.name}
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              {/* 스티커 정보 */}
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{sticker.name}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                {sticker.description}
              </p>
              
              {/* 가격 및 보유 수량 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {sticker.price} 토큰
                </span>
                {isOwned && (
                  <span style={{ fontSize: '12px', color: '#28a745' }}>
                    보유: {ownedCount}개
                  </span>
                )}
              </div>
              
              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => handleStickerPurchase(sticker)}
                  disabled={user.tokens < sticker.price}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: user.tokens < sticker.price ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: user.tokens < sticker.price ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  구매하기
                </button>
                
                {isOwned && (
                  <button
                    onClick={() => handleStickerUse(sticker)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    사용하기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayStickers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          검색 조건에 맞는 스티커가 없습니다.
        </div>
      )}
    </div>
  );
}
