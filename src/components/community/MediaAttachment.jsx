import React, { useState, useRef } from "react";

function MediaAttachment({ onMediaInsert, content, setContent }) {
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/mp4')
    );

    if (mediaFiles.length === 0) {
      alert('이미지 또는 MP4 파일만 첨부할 수 있습니다.');
      return;
    }

    // 미리보기용 파일 데이터 생성
    const previewData = mediaFiles.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            id: Date.now() + Math.random() + Math.random(),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            url: e.target.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewData).then(files => {
      setPreviewFiles(files);
    });

    // 파일 입력 초기화
    e.target.value = '';
  };

  const handleInsertMedia = (mediaData) => {
    console.log('이미지 삽입 시작:', mediaData);
    
    try {
      // 미디어 데이터를 로컬 스토리지에 저장
      localStorage.setItem(`media_${mediaData.id}`, JSON.stringify(mediaData));
      console.log('로컬 스토리지에 저장됨:', `media_${mediaData.id}`);
      
      // 본문에 미디어 삽입
      const mediaTag = `[MEDIA:${mediaData.id}]`;
      const newContent = content + '\n' + mediaTag + '\n';
      setContent(newContent);
      
      
      // 부모 컴포넌트에 미디어 삽입 알림
      if (onMediaInsert) {
        onMediaInsert(mediaData);
      }
      
      // 미리보기 상태 완전히 초기화
      setPreviewFiles([]);
      
      // 커서를 미디어 태그 뒤로 이동
      setTimeout(() => {
        const textarea = document.querySelector('textarea[name="content"]');
        if (textarea) {
          const cursorPos = newContent.length;
          textarea.setSelectionRange(cursorPos, cursorPos);
          textarea.focus();
        }
      }, 100);
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('로컬 스토리지 용량 초과, 이미지 압축 시도');
        
        // 이미지 압축 시도
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // 이미지 크기를 800px로 제한
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 압축된 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);
          
          // 압축된 이미지를 base64로 변환 (품질 0.8)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // 압축된 데이터로 미디어 객체 업데이트
          const compressedMediaData = {
            ...mediaData,
            url: compressedDataUrl
          };
          
          try {
            localStorage.setItem(`media_${mediaData.id}`, JSON.stringify(compressedMediaData));
            console.log('압축된 이미지 저장 성공');
            
            // 본문에 미디어 삽입
            const mediaTag = `[MEDIA:${mediaData.id}]`;
            const newContent = content + '\n' + mediaTag + '\n';
            setContent(newContent);
            
            
            // 부모 컴포넌트에 미디어 삽입 알림
            if (onMediaInsert) {
              onMediaInsert(compressedMediaData);
            }
            
            // 미리보기 상태 완전히 초기화
            setPreviewFiles([]);
            
            // 커서를 미디어 태그 뒤로 이동
            setTimeout(() => {
              const textarea = document.querySelector('textarea[name="content"]');
              if (textarea) {
                const cursorPos = newContent.length;
                textarea.setSelectionRange(cursorPos, cursorPos);
                textarea.focus();
              }
            }, 100);
            
          } catch (retryError) {
            console.error('압축 후에도 저장 실패:', retryError);
            alert('파일이 너무 큽니다. 더 작은 이미지를 선택해주세요.');
          }
        };
        
        img.src = mediaData.url;
        return;
      } else {
        console.error('로컬 스토리지 저장 실패:', error);
        alert('파일 저장에 실패했습니다.');
        return;
      }
    }
    
    // 정상적인 경우 (용량 문제 없음)
    // 본문에 미디어 삽입
    const mediaTag = `[MEDIA:${mediaData.id}]`;
    const newContent = content + '\n' + mediaTag + '\n';
    console.log('새로운 콘텐츠:', newContent);
    setContent(newContent);
    
    // 첨부된 파일 목록에 추가
    setAttachedFiles(prev => [...prev, mediaData]);
    
    // 부모 컴포넌트에 미디어 삽입 알림
    if (onMediaInsert) {
      onMediaInsert(mediaData);
    }
    
    // 미리보기 상태 완전히 초기화
    setPreviewFiles([]);
    
    // 커서를 미디어 태그 뒤로 이동
    setTimeout(() => {
      const textarea = document.querySelector('textarea[name="content"]');
      if (textarea) {
        const cursorPos = newContent.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
        textarea.focus();
      }
    }, 100);
  };

  const handleCancelPreview = (mediaId) => {
    setPreviewFiles(prev => prev.filter(file => file.id !== mediaId));
  };



  return (
    <div>
      {/* 미리보기 파일들 */}
      {previewFiles.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <h4 style={{ marginBottom: 10, fontSize: '14px', color: '#666' }}>미리보기</h4>
          {previewFiles.map((mediaData) => (
            <div key={mediaData.id} style={{ 
              margin: '10px 0', 
              border: '1px solid #ddd', 
              borderRadius: 4,
              padding: 10,
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  {mediaData.type === 'image' ? '📷' : '🎥'} {mediaData.name}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    type="button"
                    onClick={() => handleInsertMedia(mediaData)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    이미지삽입
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleCancelPreview(mediaData.id)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
              {mediaData.type === 'image' ? (
                <img 
                  src={mediaData.url} 
                  alt={mediaData.name}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: 4,
                    display: 'block'
                  }} 
                />
              ) : (
                <video 
                  src={mediaData.url} 
                  controls
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: 4,
                    display: 'block'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}


      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/mp4"
        multiple
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default MediaAttachment;
