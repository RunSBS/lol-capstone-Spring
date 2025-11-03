import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import backendApi from "../../data/backendApi";

function MediaAttachmentImpl({ onMediaInsert, content, setContent }, ref) {
  const [previewFiles, setPreviewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Expose method to parent to open file picker deterministically
  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  }), []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
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

  const handleInsertMedia = async (mediaData) => {
    console.log('미디어 삽입 시작:', mediaData);
    
    if (!mediaData.file) {
      alert('파일 정보가 없습니다.');
      return;
    }

    setUploading(true);
    
    try {
      // 서버에 파일 업로드
      const uploadResult = await backendApi.uploadMedia(mediaData.file);
      console.log('파일 업로드 성공:', uploadResult);
      
      // 업로드된 파일 URL로 미디어 데이터 업데이트
      const uploadedMediaData = {
        ...mediaData,
        id: mediaData.id,
        url: uploadResult.url, // 서버 URL 사용
        serverUrl: uploadResult.url,
        filename: uploadResult.filename
      };
      
      // 로컬 스토리지에도 저장 (백업용)
      try {
        localStorage.setItem(`media_${mediaData.id}`, JSON.stringify(uploadedMediaData));
      } catch (storageError) {
        console.warn('로컬 스토리지 저장 실패 (계속 진행):', storageError);
      }
      
      // 부모 컴포넌트에 미디어 삽입 알림
      if (onMediaInsert) {
        onMediaInsert(uploadedMediaData);
      }
      
      // 미리보기 상태 완전히 초기화
      setPreviewFiles([]);
      
      alert('파일이 업로드되었습니다.');
      
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setUploading(false);
    }
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
                    disabled={uploading}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: uploading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {uploading ? '업로드 중...' : (mediaData.type === 'image' ? '이미지 업로드' : '영상 업로드')}
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
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
      />
    </div>
  );
}

const MediaAttachment = forwardRef(MediaAttachmentImpl);
export default MediaAttachment;
