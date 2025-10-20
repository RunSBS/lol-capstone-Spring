import React, { useState } from 'react';

export default function StickerInventory({ user, onStickerSelect, onStickerRemove }) {
  const [selectedSticker, setSelectedSticker] = useState(null);

  const handleStickerSelect = (stickerId) => {
    console.log('Selecting sticker:', stickerId);
    setSelectedSticker(stickerId);
    const sticker = ownedStickers.find(s => s.id === stickerId);
    console.log('Found sticker:', sticker);
    if (sticker) {
      onStickerSelect(sticker);
    }
  };

  const handleStickerRemove = (stickerId) => {
    if (confirm('이 스티커를 삭제하시겠습니까?')) {
      onStickerRemove(stickerId);
      if (selectedSticker === stickerId) {
        setSelectedSticker(null);
      }
    }
  };

  // 보유한 스티커 목록 생성
  const ownedStickers = [];
  if (user.stickers) {
    Object.entries(user.stickers).forEach(([stickerId, count]) => {
      if (count > 0) {
        // 스티커 정보 찾기 (실제로는 API에서 가져와야 함)
        const stickerInfo = {
          id: stickerId,
          stickerId: stickerId,
          name: getStickerName(stickerId),
          image: getStickerImage(stickerId),
          count: count
        };
        ownedStickers.push(stickerInfo);
      }
    });
  }

  // 스티커 이름 매핑 (실제로는 API에서 가져와야 함)
  function getStickerName(stickerId) {
    const nameMap = {
      'emote_01': '기쁨',
      'emote_02': '슬픔', 
      'emote_03': '화남',
      'emote_04': '놀람',
      'emote_05': '사랑',
      'emote_06': '웃음',
      'emote_07': '승리',
      'emote_08': '패배'
    };
    return nameMap[stickerId] || stickerId;
  }

  // 스티커 이미지 매핑 (실제로는 API에서 가져와야 함)
  function getStickerImage(stickerId) {
    const imageMap = {
      'emote_01': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png',
      'emote_02': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Yasuo.png',
      'emote_03': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Jinx.png',
      'emote_04': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lux.png',
      'emote_05': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Thresh.png',
      'emote_06': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Zed.png',
      'emote_07': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Darius.png',
      'emote_08': 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png'
    };
    return imageMap[stickerId] || 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png';
  }

  if (ownedStickers.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>스티커 보유탭</h3>
        <div style={{ color: '#666', padding: '40px' }}>
          보유한 스티커가 없습니다.<br />
          스티커 상점에서 구매해보세요!
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>스티커 보유탭</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px' 
      }}>
        {ownedStickers.map((sticker) => (
          <div 
            key={sticker.id}
            style={{ 
              border: selectedSticker === sticker.id ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: selectedSticker === sticker.id ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleStickerSelect(sticker.id)}
          >
            {/* 스티커 이미지 */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <img 
                src={sticker.image} 
                alt={sticker.name}
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            {/* 스티커 정보 */}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{sticker.name}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                보유: {sticker.count}개
              </p>
              
              {/* 선택 상태 표시 */}
              {selectedSticker === sticker.id && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#007bff', 
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  선택됨
                </div>
              )}
              
              {/* 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStickerRemove(sticker.id);
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSticker && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>선택된 스티커</h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            이제 배너에 스티커를 부착할 수 있습니다. 배너 영역을 클릭하여 스티커를 배치하세요.
          </p>
          <button
            onClick={() => setSelectedSticker(null)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            선택 해제
          </button>
        </div>
      )}
    </div>
  );
}
