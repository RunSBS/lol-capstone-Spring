import React, { useState, useEffect } from 'react';
import { loadStickers, loadEmotes, loadChampions, loadItems, loadRunes, buildItemIconUrl, buildChampionSquareUrl } from '../../data/ddragon';
import { fetchDDragonVersion } from '../../data/api';

export default function StickerShop({ user, onStickerPurchase, onStickerInventory }) {
  const [stickers, setStickers] = useState([]);
  const [championStickers, setChampionStickers] = useState([]);
  const [itemStickers, setItemStickers] = useState([]);
  const [runeStickers, setRuneStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadStickerData();
  }, []);

  const loadStickerData = async () => {
    try {
      setLoading(true);
      console.log('스티커 데이터 로딩 시작...');
      
      // API 호출 없이 하드코딩된 데이터만 사용
      const ddVer = '15.18.1';
      
      // 기본 이모트 스티커 (제거됨)
      const basicStickers = [];
      
      setStickers(basicStickers);
      console.log('기본 스티커 설정됨:', basicStickers.length, '개');

      // 챔피언 스티커 (하드코딩)
      const championStickers = [
        { id: 'Ahri', name: '아리' },
        { id: 'Yasuo', name: '야스오' },
        { id: 'Jinx', name: '징크스' },
        { id: 'Lux', name: '럭스' },
        { id: 'Thresh', name: '쓰레쉬' },
        { id: 'Zed', name: '제드' },
        { id: 'Darius', name: '다리우스' },
        { id: 'Aatrox', name: '아트록스' },
        { id: 'Garen', name: '가렌' },
        { id: 'Katarina', name: '카타리나' },
        { id: 'LeeSin', name: '리 신' },
        { id: 'Vayne', name: '베인' },
        { id: 'MasterYi', name: '마스터 이' },
        { id: 'MissFortune', name: '미스 포츈' },
        { id: 'Caitlyn', name: '케이틀린' },
        { id: 'Ashe', name: '애쉬' },
        { id: 'Sona', name: '소나' },
        { id: 'Soraka', name: '소라카' },
        { id: 'Janna', name: '잔나' },
        { id: 'Lulu', name: '룰루' }
      ].map(champion => ({
        id: `champion_${champion.id}`,
        name: champion.name,
        description: '챔피언 아이콘 스티커',
        price: Math.floor(Math.random() * 50) + 30,
        category: 'champion',
        image: buildChampionSquareUrl(ddVer, champion.id),
        fallbackImage: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png'
      }));
      
      setChampionStickers(championStickers);
      console.log('챔피언 스티커 설정됨:', championStickers.length, '개');

      // 아이템 스티커 (하드코딩)
      const itemStickers = [
        { id: 3089, name: '라바돈의 죽음모자', gold: { total: 3600 } },
        { id: 1001, name: '장화', gold: { total: 300 } },
        { id: 3031, name: '무한의 대검', gold: { total: 3400 } },
        { id: 3071, name: '칠흑의 양날 도끼', gold: { total: 3200 } },
        { id: 3026, name: '수호 천사', gold: { total: 2800 } },
        { id: 3006, name: '광전사의 군화', gold: { total: 1100 } },
        { id: 3157, name: '존야의 모래시계', gold: { total: 3000 } },
        { id: 3036, name: '도미닉 경의 인사', gold: { total: 3200 } },
        { id: 3072, name: '피바라기', gold: { total: 3000 } },
        { id: 3153, name: '몰락한 왕의 검', gold: { total: 3300 } },
        { id: 3003, name: '대천사의 지팡이', gold: { total: 1100 } },
        { id: 3035, name: '최후의 속삭임', gold: { total: 3000 } },
        { id: 3004, name: '마나무네', gold: { total: 50 } },
        { id: 2003, name: '체력 물약', gold: { total: 50 } },
        { id: 1036, name: '롱소드', gold: { total: 350 } },
        { id: 1038, name: 'B.F. 대검', gold: { total: 1300 } },
        { id: 1037, name: '곡괭이', gold: { total: 875 } },
        { id: 1042, name: '단검', gold: { total: 300 } },
        { id: 1055, name: '도란의 검', gold: { total: 450 } },
        { id: 1056, name: '도란의 반지', gold: { total: 400 } }
      ].map(item => ({
        id: `item_${item.id}`,
        name: item.name,
        description: '아이템 아이콘 스티커',
        price: Math.floor((item.gold?.total || 1000) / 50) + 20,
        category: 'item',
        image: buildItemIconUrl(ddVer, item.id),
        fallbackImage: 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1001.png'
      }));
      
      setItemStickers(itemStickers);
      console.log('아이템 스티커 설정됨:', itemStickers.length, '개');

      // 룬 스티커 로드
      const runeStickers = await loadRunes(ddVer, 'ko_KR');
      setRuneStickers(runeStickers);
      console.log('룬 스티커 설정됨:', runeStickers.length, '개');
      
      console.log('모든 스티커 로딩 완료!');
      
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

  const getDisplayStickers = () => {
    let result = [];
    switch (activeTab) {
      case 'champion':
        result = championStickers;
        console.log(`챔피언 탭 - 챔피언 스티커만 표시:`, result.map(s => ({ id: s.id, name: s.name, category: s.category })));
        break;
        case 'item':
          result = itemStickers;
          console.log(`아이템 탭 - 아이템 스티커만 표시:`, result.map(s => ({ id: s.id, name: s.name, category: s.category })));
          break;
        case 'rune':
          result = runeStickers;
          console.log(`룬 탭 - 룬 스티커만 표시:`, result.map(s => ({ id: s.id, name: s.name, category: s.category })));
          break;
        case 'all':
        default:
          result = [...stickers, ...championStickers, ...itemStickers, ...runeStickers];
          console.log(`전체 탭 - 모든 스티커 표시:`, {
            기존스티커: stickers.length,
            챔피언스티커: championStickers.length,
            아이템스티커: itemStickers.length,
            룬스티커: runeStickers.length,
            총합: result.length
          });
          break;
    }
    console.log(`현재 탭: ${activeTab}, 표시할 스티커 수: ${result.length}`);
    return result;
  };

  const displayStickers = getDisplayStickers();

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
        
        {/* 탭 네비게이션 */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '1px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'all' ? '#007bff' : 'transparent',
              color: activeTab === 'all' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '14px',
              fontWeight: activeTab === 'all' ? 'bold' : 'normal'
            }}
          >
            전체
          </button>
          <button
            onClick={() => setActiveTab('champion')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'champion' ? '#007bff' : 'transparent',
              color: activeTab === 'champion' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '14px',
              fontWeight: activeTab === 'champion' ? 'bold' : 'normal'
            }}
          >
            챔피언
          </button>
          <button
            onClick={() => setActiveTab('item')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'item' ? '#007bff' : 'transparent',
              color: activeTab === 'item' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '14px',
              fontWeight: activeTab === 'item' ? 'bold' : 'normal'
            }}
          >
            아이템
          </button>
          <button
            onClick={() => setActiveTab('rune')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'rune' ? '#007bff' : 'transparent',
              color: activeTab === 'rune' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontSize: '14px',
              fontWeight: activeTab === 'rune' ? 'bold' : 'normal'
            }}
          >
            룬
          </button>
        </div>
      </div>

      {/* 스티커 그리드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '15px',
        maxHeight: '600px',
        overflowY: 'auto'
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
                  onError={(e) => {
                    if (sticker.fallbackImage && e.target.src !== sticker.fallbackImage) {
                      e.target.src = sticker.fallbackImage;
                    }
                  }}
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    objectFit: 'contain',
                    borderRadius: '4px',
                    backgroundColor: '#f0f0f0'
                  }}
                />
              </div>
              
              {/* 스티커 정보 */}
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{sticker.name}</h4>
              {sticker.category !== 'rune' && (
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                  {sticker.description}
                </p>
              )}
              <p style={{ margin: '0 0 10px 0', fontSize: '10px', color: '#999' }}>
                ID: {sticker.id} | 카테고리: {sticker.category || 'unknown'}
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

      {displayStickers.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>표시할 스티커가 없습니다.</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            현재 탭: {activeTab} | 
            기존 스티커: {stickers.length}개 | 
            챔피언 스티커: {championStickers.length}개 | 
            아이템 스티커: {itemStickers.length}개 |
            룬 스티커: {runeStickers.length}개
          </p>
        </div>
      )}
    </div>
  );
}
