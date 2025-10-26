import React, { useState, useRef, useEffect } from 'react';

export default function StickerBanner({ 
  bannerImage, 
  stickers = [], 
  onStickerAdd, 
  onStickerUpdate, 
  onStickerRemove,
  selectedStickerId,
  selectedStickerImageUrl,
  isEditMode = false 
}) {
  const bannerRef = useRef(null);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [selectedBannerSticker, setSelectedBannerSticker] = useState(null);
  const interactionRef = useRef(null); // { kind: 'move'|'rotate'|'resize', corner?, center:{cx,cy}, initial:{scale, rotation, dist, angleDeg} }
  const [isInteracting, setIsInteracting] = useState(false);

  // 외부에서 stickers가 갱신될 때 선택된 스티커도 최신값으로 동기화
  useEffect(() => {
    if (!selectedBannerSticker) return;
    const latest = (stickers || []).find(s => s.id === selectedBannerSticker.id);
    if (latest) {
      setSelectedBannerSticker(latest);
    }
  }, [stickers]);

  // 배너 클릭 시 스티커 추가
  const handleBannerClick = (e) => {
    console.log('Banner clicked:', { selectedStickerId, isEditMode, event: e });
    
    if (!selectedStickerId || !isEditMode) {
      console.log('Cannot add sticker:', { selectedStickerId, isEditMode });
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = bannerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log('Adding sticker at position:', { x, y });

    const newSticker = {
      id: `sticker_${Date.now()}`,
      stickerId: selectedStickerId,
      image: selectedStickerImageUrl || null,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      scale: 1,
      rotation: 0,
      zIndex: stickers.length + 1
    };

    console.log('New sticker object:', newSticker);
    onStickerAdd(newSticker);
  };

  // 스티커 클릭/드래그 시작
  const handleStickerMouseDown = (e, sticker) => {
    e.preventDefault();
    e.stopPropagation(); // 배너 클릭 이벤트 방지
    
    // 스티커 선택
    setSelectedBannerSticker(sticker);
    
    // 항상 드래그 가능 (편집 모드와 관계없이)
    setDraggedSticker(sticker);
  };

  // 스티커 드래그 중
  const handleMouseMove = (e) => {
    if (!bannerRef.current) return;

    const rect = bannerRef.current.getBoundingClientRect();
    const toPercent = (pxX, pxY) => ({
      xp: Math.max(0, Math.min(100, ((pxX - rect.left) / rect.width) * 100)),
      yp: Math.max(0, Math.min(100, ((pxY - rect.top) / rect.height) * 100)),
    });

    // 회전/리사이즈 중이면 우선 처리
    if (interactionRef.current && selectedBannerSticker) {
      const { kind, center, initial } = interactionRef.current;
      if (kind === 'rotate') {
        const dx = e.clientX - center.cx;
        const dy = e.clientY - center.cy;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI;
        const delta = angleDeg - initial.angleDeg;
        const newRotation = (initial.rotation + delta + 3600) % 360;
        const updatedSticker = { ...selectedBannerSticker, rotation: newRotation };
        onStickerUpdate(updatedSticker);
        setSelectedBannerSticker(updatedSticker);
        return;
      }
      if (kind === 'resize') {
        const dx = e.clientX - center.cx;
        const dy = e.clientY - center.cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const scaleRatio = dist / Math.max(1, initial.dist);
        const newScale = Math.max(0.5, Math.min(2, initial.scale * scaleRatio));
        const updatedSticker = { ...selectedBannerSticker, scale: newScale };
        onStickerUpdate(updatedSticker);
        setSelectedBannerSticker(updatedSticker);
        return;
      }
    }

    // 이동
    if (!draggedSticker) return;
    const { xp, yp } = toPercent(e.clientX, e.clientY);
    const updatedSticker = { ...draggedSticker, x: xp, y: yp };
    onStickerUpdate(updatedSticker);
    setDraggedSticker(updatedSticker);
    setSelectedBannerSticker(updatedSticker);
  };

  // 스티커 드래그 종료
  const handleMouseUp = () => {
    setDraggedSticker(null);
    interactionRef.current = null;
    setIsInteracting(false);
  };

  // 스티커 크기 조절
  const handleStickerWheel = (e, sticker) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, sticker.scale + delta));
    
    const updatedSticker = {
      ...sticker,
      scale: newScale
    };

    onStickerUpdate(updatedSticker);
  };

  // 스티커 회전
  const handleStickerDoubleClick = (e, sticker) => {
    e.preventDefault();
    const newRotation = (sticker.rotation + 45) % 360;
    
    const updatedSticker = {
      ...sticker,
      rotation: newRotation
    };

    onStickerUpdate(updatedSticker);
  };

  // 스티커 삭제
  const handleStickerDelete = (e, sticker) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('이 스티커를 삭제하시겠습니까?')) {
      onStickerRemove(sticker.id);
      setSelectedBannerSticker(null);
    }
  };

  // 스티커 크기 조절 (슬라이더)
  const handleScaleChange = (sticker, newScale) => {
    const updatedSticker = {
      ...sticker,
      scale: Math.max(0.5, Math.min(2, newScale))
    };
    onStickerUpdate(updatedSticker);
    setSelectedBannerSticker(updatedSticker);
  };

  // 스티커 회전 (슬라이더)
  const handleRotationChange = (sticker, newRotation) => {
    const updatedSticker = {
      ...sticker,
      rotation: newRotation
    };
    onStickerUpdate(updatedSticker);
    setSelectedBannerSticker(updatedSticker);
  };

  // 스티커 위치 조절 (숫자 입력)
  const handlePositionChange = (sticker, axis, value) => {
    const updatedSticker = {
      ...sticker,
      [axis]: Math.max(0, Math.min(100, value))
    };
    onStickerUpdate(updatedSticker);
    setSelectedBannerSticker(updatedSticker);
  };

  const getStickerCenterPx = (sticker) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (!rect) return { cx: 0, cy: 0 };
    const cx = rect.left + (sticker.x / 100) * rect.width;
    const cy = rect.top + (sticker.y / 100) * rect.height;
    return { cx, cy };
  };

  const startRotate = (e, sticker) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBannerSticker(sticker);
    const center = getStickerCenterPx(sticker);
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    interactionRef.current = {
      kind: 'rotate',
      center,
      initial: { angleDeg, rotation: sticker.rotation },
    };
    setIsInteracting(true);
  };

  const startResize = (e, sticker, corner) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBannerSticker(sticker);
    const center = getStickerCenterPx(sticker);
    const dx = e.clientX - center.cx;
    const dy = e.clientY - center.cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    interactionRef.current = {
      kind: 'resize',
      corner,
      center,
      initial: { dist, scale: sticker.scale },
    };
    setIsInteracting(true);
  };

  // 스티커 이름 가져오기
  const getStickerName = (stickerId) => {
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
  };

  // 스티커 이미지 가져오기
  const getStickerImage = (sticker) => {
    if (sticker?.image) return sticker.image;
    const stickerId = sticker?.stickerId;
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
  };

  // 이벤트 리스너 등록 (이동/회전/리사이즈 중에 전역 추적)
  useEffect(() => {
    if (draggedSticker || isInteracting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSticker, isInteracting]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 배너 배경 */}
      <div
        ref={bannerRef}
        style={{
          position: 'relative',
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '12px',
          minHeight: '300px',
          cursor: isEditMode && selectedStickerId ? 'crosshair' : 'default',
          overflow: 'hidden'
        }}
        onClick={handleBannerClick}
        onMouseDown={(e) => {
          // 스티커가 아닌 배너 영역을 클릭했을 때만 처리
          if (e.target === bannerRef.current || e.target.closest('.banner-overlay')) {
            handleBannerClick(e);
          }
        }}
      >
        {/* 배너 오버레이 */}
        <div 
          className="banner-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            pointerEvents: isEditMode && selectedStickerId ? 'auto' : 'none'
          }} 
        />

        {/* 스티커들 */}
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            style={{
              position: 'absolute',
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              zIndex: sticker.zIndex,
              cursor: 'pointer',
              border: selectedBannerSticker?.id === sticker.id ? '3px solid #007bff' : '2px solid transparent',
              borderRadius: '4px',
              padding: '2px',
              backgroundColor: selectedBannerSticker?.id === sticker.id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
            onWheel={(e) => handleStickerWheel(e, sticker)}
            onDoubleClick={(e) => handleStickerDoubleClick(e, sticker)}
          >
            <img
              src={getStickerImage(sticker)}
              alt="sticker"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* 회전 핸들: 상단 중앙 */}
            {selectedBannerSticker?.id === sticker.id && (
              <div
                onMouseDown={(e) => startRotate(e, sticker)}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  border: '1px solid #fff',
                  boxShadow: '0 0 1px rgba(0,0,0,0.35)',
                  cursor: 'grab',
                  pointerEvents: 'auto',
                  zIndex: 2
                }}
                title="드래그하여 회전"
              />
            )}

            {/* 리사이즈 핸들: 좌상, 좌하, 우하 (우상은 삭제 버튼과 충돌 방지) */}
            {selectedBannerSticker?.id === sticker.id && (
              <>
                <div
                  onMouseDown={(e) => startResize(e, sticker, 'top-left')}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '-5px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #007bff',
                    borderRadius: '2px',
                    cursor: 'nwse-resize',
                    pointerEvents: 'auto',
                    zIndex: 2
                  }}
                  title="드래그하여 크기 조절"
                />
                <div
                  onMouseDown={(e) => startResize(e, sticker, 'bottom-left')}
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '-5px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #007bff',
                    borderRadius: '2px',
                    cursor: 'nesw-resize',
                    pointerEvents: 'auto',
                    zIndex: 2
                  }}
                  title="드래그하여 크기 조절"
                />
                <div
                  onMouseDown={(e) => startResize(e, sticker, 'bottom-right')}
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #007bff',
                    borderRadius: '2px',
                    cursor: 'nwse-resize',
                    pointerEvents: 'auto',
                    zIndex: 2
                  }}
                  title="드래그하여 크기 조절"
                />
              </>
            )}
            
            {/* 선택된 스티커에만 삭제 버튼 표시 */}
            {selectedBannerSticker?.id === sticker.id && (
              <button
                onMouseDown={(e) => { e.stopPropagation(); }}
                onClick={(e) => handleStickerDelete(e, sticker)}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* 편집 모드 안내 */}
        {isEditMode && selectedStickerId && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            배너를 클릭하여 스티커를 배치하세요
          </div>
        )}
      </div>

      {/* 스티커 조작 컨트롤 패널 */}
      {selectedBannerSticker && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
            스티커 조작: {getStickerName(selectedBannerSticker.stickerId)}
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* 크기 조절 */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                크기: {Math.round(selectedBannerSticker.scale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={selectedBannerSticker.scale}
                onChange={(e) => handleScaleChange(selectedBannerSticker, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* 회전 조절 */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                회전: {selectedBannerSticker.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={selectedBannerSticker.rotation}
                onChange={(e) => handleRotationChange(selectedBannerSticker, parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* X 위치 조절 */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                X 위치: {Math.round(selectedBannerSticker.x)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedBannerSticker.x}
                onChange={(e) => handlePositionChange(selectedBannerSticker, 'x', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(selectedBannerSticker.x)}
                onChange={(e) => handlePositionChange(selectedBannerSticker, 'x', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '4px', marginTop: '5px' }}
              />
            </div>

            {/* Y 위치 조절 */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Y 위치: {Math.round(selectedBannerSticker.y)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedBannerSticker.y}
                onChange={(e) => handlePositionChange(selectedBannerSticker, 'y', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(selectedBannerSticker.y)}
                onChange={(e) => handlePositionChange(selectedBannerSticker, 'y', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '4px', marginTop: '5px' }}
              />
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStickerDelete(null, selectedBannerSticker)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              스티커 삭제
            </button>
            
            <button
              onClick={() => setSelectedBannerSticker(null)}
              style={{
                padding: '8px 16px',
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
        </div>
      )}

    </div>
  );
}
