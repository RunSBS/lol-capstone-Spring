import React, { useState } from 'react';
import { buildChampionSquareUrl, buildItemIconUrl } from '../../data/ddragon';

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
    // 챔피언 스티커
    if (stickerId.startsWith('champion_')) {
      const championName = stickerId.replace('champion_', '');
      const championNames = {
        'Ahri': '아리', 'Yasuo': '야스오', 'Jinx': '징크스', 'Lux': '럭스', 'Thresh': '쓰레쉬',
        'Zed': '제드', 'Darius': '다리우스', 'Aatrox': '아트록스', 'Garen': '가렌', 'Katarina': '카타리나',
        'LeeSin': '리 신', 'Vayne': '베인', 'MasterYi': '마스터 이', 'MissFortune': '미스 포츈',
        'Caitlyn': '케이틀린', 'Ashe': '애쉬', 'Sona': '소나', 'Soraka': '소라카', 'Janna': '잔나', 'Lulu': '룰루'
      };
      return championNames[championName] || championName;
    }
    
    // 아이템 스티커
    if (stickerId.startsWith('item_')) {
      const itemId = stickerId.replace('item_', '');
      const itemNames = {
        '3089': '라바돈의 죽음모자', '1001': '장화', '3031': '무한의 대검', '3071': '칠흑의 양날 도끼',
        '3026': '수호 천사', '3006': '광전사의 군화', '3157': '존야의 모래시계', '3036': '도미닉 경의 인사',
        '3072': '피바라기', '3153': '몰락한 왕의 검', '3003': '대천사의 지팡이', '3035': '최후의 속삭임',
        '3004': '마나무네', '2003': '체력 물약', '1036': '롱소드', '1038': 'B.F. 대검',
        '1037': '곡괭이', '1042': '단검', '1055': '도란의 검', '1056': '도란의 반지'
      };
      return itemNames[itemId] || `아이템 ${itemId}`;
    }
    
    // 룬 스티커
    if (stickerId.startsWith('rune_') || stickerId.startsWith('style_')) {
      // 룬 이름은 Data Dragon에서 가져온 실제 이름을 사용
      return stickerId.replace('rune_', '').replace('style_', '');
    }
    
    // 기존 에모트 스티커
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
    const ddVer = '15.18.1';
    
    // 챔피언 스티커
    if (stickerId.startsWith('champion_')) {
      const championName = stickerId.replace('champion_', '');
      return buildChampionSquareUrl(ddVer, championName);
    }
    
    // 아이템 스티커
    if (stickerId.startsWith('item_')) {
      const itemId = stickerId.replace('item_', '');
      return buildItemIconUrl(ddVer, itemId);
    }
    
    // 룬 스티커
    if (stickerId.startsWith('rune_') || stickerId.startsWith('style_')) {
      // 룬 이미지는 Data Dragon CDN에서 가져옴
      const runeId = stickerId.replace('rune_', '').replace('style_', '');
      if (stickerId.startsWith('style_')) {
        return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${runeId}.png`;
      } else {
        return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/${runeId}.png`;
      }
    }
    
    // 기존 에모트 스티커
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

  // 스티커 카테고리 반환
  function getStickerCategory(stickerId) {
    if (stickerId.startsWith('champion_')) return '챔피언';
    if (stickerId.startsWith('item_')) return '아이템';
    if (stickerId.startsWith('rune_')) return '룬';
    if (stickerId.startsWith('style_')) return '룬 스타일';
    if (stickerId.startsWith('emote_')) return '이모트';
    return '기타';
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
                onError={(e) => {
                  e.target.src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png';
                }}
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  objectFit: 'contain',
                  borderRadius: '4px',
                  backgroundColor: '#f0f0f0'
                }}
              />
            </div>
            
            {/* 스티커 정보 */}
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{sticker.name}</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '10px', color: '#999' }}>
                {getStickerCategory(sticker.id)}
              </p>
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
