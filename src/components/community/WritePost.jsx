import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import boardApi from "../../data/communityApi";
import VoteSection from "./VoteSection";
import MediaAttachment from "./MediaAttachment";

function WritePost({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "free",
    tags: [],
    writerB: ""
  });
  const [showVoteSection, setShowVoteSection] = useState(false);
  const [voteData, setVoteData] = useState(null);
  const [attachedMedia, setAttachedMedia] = useState([]);

  // 수정 모드인지 확인
  const postToEdit = location.state?.postToEdit;
  const isEditMode = !!postToEdit;

  useEffect(() => {
    if (isEditMode && postToEdit) {
      const isLol = (postToEdit.category || "") === "lolmuncheol";
      const initialContent = isLol && currentUser === postToEdit.writerB
        ? (postToEdit.contentB || "")
        : (postToEdit.content || "");
      setFormData({
        title: postToEdit.title || "",
        content: initialContent,
        category: postToEdit.category || "free",
        tags: postToEdit.tags || [],
        writerB: postToEdit.writerB || ""
      });
      
      // 투표 데이터가 있으면 표시
      if (postToEdit.vote) {
        setVoteData(postToEdit.vote);
        setShowVoteSection(true);
      }
    }
  }, [isEditMode, postToEdit]);

  // 롤문철 글 작성 시 투표 강제 생성
  useEffect(() => {
    if (formData.category === "lolmuncheol" && !isEditMode) {
      // 기본 투표 데이터 생성
      const defaultVoteData = {
        question: "누가 이길까요?",
        options: ["사용자A", "사용자B"],
        description: "",
        hasEndTime: true,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 7일 후
      };
      setVoteData(defaultVoteData);
      setShowVoteSection(true);
    }
  }, [formData.category, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (formData.category === "lolmuncheol") {
      if (!formData.writerB.trim()) {
        alert("롤문철 카테고리에서는 상대 사용자 닉네임이 필요합니다.");
        return;
      }
    }

    try {
      const payload = { ...formData, writer: currentUser };
      
      // 투표 데이터가 있으면 포함
      if (voteData && voteData.question.trim()) {
        payload.vote = voteData;
      }
      
      if (isEditMode) {
        const isLol = formData.category === "lolmuncheol";
        if (isLol) {
          // 작성자B는 오른쪽 칸만 수정, 작성자A는 왼쪽 칸만 수정
          if (currentUser === postToEdit.writerB) {
            delete payload.content; // 왼쪽 본문은 건드리지 않음
            payload.contentB = formData.content; // 오른쪽 본문 갱신
          } else {
            // 작성자A 또는 관리자: 왼쪽 본문 갱신, 오른쪽은 유지
            delete payload.contentB;
          }
        }
        await boardApi.updatePost(postToEdit.id, payload);
        alert("글이 수정되었습니다.");
      } else {
        await boardApi.createPost(payload);
        alert("글이 작성되었습니다.");
      }
      
      navigate(`/community/${formData.category}`);
    } catch (error) {
      alert("작성 중 오류가 발생했습니다: " + error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoteChange = (newVoteData) => {
    setVoteData(newVoteData);
  };

  const toggleVoteSection = () => {
    // 롤문철 글에서는 투표 섹션을 숨길 수 없음
    if (formData.category === "lolmuncheol") {
      alert("롤문철 글에서는 투표가 필수입니다.");
      return;
    }
    
    setShowVoteSection(!showVoteSection);
    if (showVoteSection) {
      setVoteData(null);
    }
  };

  const handleMediaInsert = (mediaData) => {
    setAttachedMedia(prev => [...prev, mediaData]);
    
    // contentEditable에 미디어 삽입
    const contentEditable = document.querySelector('[contenteditable="true"]');
    if (contentEditable) {
      // 미디어 HTML 생성
      let mediaHtml = '';
      if (mediaData.type === 'image') {
        mediaHtml = `<img src="${mediaData.url}" alt="${mediaData.name}" style="max-width: 200px; max-height: 150px; margin: 2px; vertical-align: middle; display: inline-block; border-radius: 4px;" />`;
      } else if (mediaData.type === 'video') {
        mediaHtml = `<video src="${mediaData.url}" controls style="max-width: 200px; max-height: 150px; margin: 2px; vertical-align: middle; display: inline-block; border-radius: 4px;" />`;
      }
      
      // 맨 끝에 미디어 삽입
      contentEditable.insertAdjacentHTML('beforeend', mediaHtml);
      
      // 커서를 미디어 뒤로 이동
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(contentEditable);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // contentEditable에 포커스 유지
      contentEditable.focus();
      
      // formData 업데이트
      const content = contentEditable.innerText;
      setFormData(prev => ({
        ...prev,
        content: content
      }));
    }
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // contentEditable 내용을 formData에 동기화하는 함수
  const syncContentEditable = () => {
    const contentEditable = document.querySelector('[contenteditable="true"]');
    if (contentEditable) {
      const content = contentEditable.innerText;
      setFormData(prev => ({
        ...prev,
        content: content
      }));
    }
  };



  // 미디어 태그를 실제 미디어로 변환하는 함수 (contentEditable용)
  const renderContentWithMedia = (content) => {
    if (!content) return '';
    
    // [MEDIA:id] 태그를 찾아서 실제 미디어로 변환
    const mediaTagRegex = /\[MEDIA:([^\]]+)\]/g;
    let processedContent = content;
    
    // 미디어 태그를 실제 미디어로 변환
    processedContent = processedContent.replace(mediaTagRegex, (match, mediaId) => {
      const mediaData = getMediaDataById(mediaId);
      
      if (mediaData && mediaData.url) {
        if (mediaData.type === 'image') {
          return `<img src="${mediaData.url}" alt="${mediaData.name}" style="max-width: 200px; max-height: 150px; border-radius: 4px; margin: 2px; vertical-align: middle; display: inline-block;" />`;
        } else if (mediaData.type === 'video') {
          return `<video src="${mediaData.url}" controls style="max-width: 200px; max-height: 150px; border-radius: 4px; margin: 2px; vertical-align: middle; display: inline-block;" />`;
        }
      }
      
      // 미디어 데이터를 찾을 수 없는 경우
      return `<span style="display: inline-block; margin: 2px; padding: 4px 8px; border: 1px dashed #ddd; border-radius: 4px; background: #f8f9fa; color: #666; font-size: 12px; vertical-align: middle;">
        📎
      </span>`;
    });
    
    return processedContent;
  };

  // 인라인 미디어 렌더링 함수 (커서의 영향을 받도록)
  const renderContentWithMediaInline = (content) => {
    if (!content) return "";
    
    // 텍스트를 줄별로 분리
    const lines = content.split('\n');
    const result = [];
    
    lines.forEach((line, lineIndex) => {
      // [MEDIA:id] 패턴을 찾아서 실제 미디어로 교체
      const mediaRegex = /\[MEDIA:([^\]]+)\]/g;
      let lastIndex = 0;
      let match;
      
      while ((match = mediaRegex.exec(line)) !== null) {
        // 미디어 태그 앞의 텍스트 추가
        if (match.index > lastIndex) {
          result.push(
            <span key={`text-${lineIndex}-${lastIndex}`}>
              {line.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        // 미디어 데이터 가져오기
        const mediaData = getMediaDataById(match[1]);
        if (mediaData) {
          if (mediaData.type === 'image') {
            result.push(
              <img 
                key={`media-${lineIndex}-${match.index}`}
                src={mediaData.url} 
                alt={mediaData.name}
                style={{
                  maxWidth: "200px",
                  maxHeight: "150px",
                  margin: "2px",
                  verticalAlign: "middle",
                  display: "inline-block",
                  borderRadius: "4px"
                }}
              />
            );
          } else if (mediaData.type === 'video') {
            result.push(
              <video 
                key={`media-${lineIndex}-${match.index}`}
                src={mediaData.url} 
                controls
                style={{
                  maxWidth: "200px",
                  maxHeight: "150px",
                  margin: "2px",
                  verticalAlign: "middle",
                  display: "inline-block",
                  borderRadius: "4px"
                }}
              />
            );
          }
        } else {
          // 미디어 데이터를 찾을 수 없는 경우 원본 텍스트 표시
          result.push(
            <span key={`text-${lineIndex}-${match.index}`}>
              {match[0]}
            </span>
          );
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // 마지막 텍스트 추가
      if (lastIndex < line.length) {
        result.push(
          <span key={`text-${lineIndex}-${lastIndex}`}>
            {line.substring(lastIndex)}
          </span>
        );
      }
      
      // 줄바꿈 추가 (마지막 줄 제외)
      if (lineIndex < lines.length - 1) {
        result.push(<br key={`br-${lineIndex}`} />);
      }
    });
    
    return result;
  };

  // 미디어 데이터를 ID로 찾는 함수
  const getMediaDataById = (mediaId) => {
    try {
      const storedMedia = localStorage.getItem(`media_${mediaId}`);
      if (storedMedia) {
        return JSON.parse(storedMedia);
      }
      
      // 모든 미디어 키를 검색해서 찾기
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('media_')) {
          const mediaData = JSON.parse(localStorage.getItem(key));
          if (mediaData && mediaData.id === mediaId) {
            return mediaData;
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>{isEditMode ? "글 수정" : "글 작성"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            카테고리
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ padding: 8, width: 200 }}
          >
            <option value="free">자유게시판</option>
            <option value="guide">공략</option>
            <option value="lolmuncheol">롤문철</option>
          </select>
        </div>

        {formData.category === "lolmuncheol" && (
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
              상대 사용자 (작성자B 닉네임)
            </label>
            <input
              type="text"
              name="writerB"
              value={formData.writerB}
              onChange={handleInputChange}
              placeholder="작성자B 닉네임을 입력하세요"
              style={{ 
                width: "100%", 
                padding: 10, 
                border: "1px solid #ddd",
                borderRadius: 4 
              }}
              required
            />
          </div>
        )}

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            제목
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목을 입력하세요"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4 
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            내용
          </label>
          
          {/* 미디어 첨부 섹션 */}
          <MediaAttachment 
            onMediaInsert={handleMediaInsert}
            content={formData.content}
            setContent={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
          />
          
          <div 
            style={{ 
              width: "100%", 
              minHeight: "300px",
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4,
              backgroundColor: "white",
              position: "relative",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              wordBreak: "break-word"
            }}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={(e) => {
              const content = e.target.innerText;
              setFormData(prev => ({
                ...prev,
                content: content
              }));
            }}
            onKeyDown={(e) => {
              // Enter 키 처리
              if (e.key === 'Enter') {
                e.preventDefault();
                // 현재 커서 위치에 줄바꿈 삽입
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const br = document.createElement('br');
                  range.insertNode(br);
                  range.setStartAfter(br);
                  range.setEndAfter(br);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
              
              // Space 키 처리
              if (e.key === ' ') {
                e.preventDefault();
                // 현재 커서 위치에 공백 삽입
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const textNode = document.createTextNode(' ');
                  range.insertNode(textNode);
                  range.setStartAfter(textNode);
                  range.setEndAfter(textNode);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }}
            dangerouslySetInnerHTML={{ 
              __html: renderContentWithMedia(formData.content) 
            }}
          />
        </div>

        {/* 첨부 및 투표 버튼 */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            📎 미디어 첨부
          </button>
          <button
            type="button"
            onClick={toggleVoteSection}
            style={{
              padding: "10px 20px",
              backgroundColor: formData.category === "lolmuncheol" 
                ? "#6c757d" 
                : (showVoteSection ? "#dc3545" : "#28a745"),
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: formData.category === "lolmuncheol" ? "not-allowed" : "pointer"
            }}
            disabled={formData.category === "lolmuncheol"}
          >
            {formData.category === "lolmuncheol" 
              ? "📊 투표 필수" 
              : (showVoteSection ? "📊 투표 제거" : "📊 투표 추가")
            }
          </button>
        </div>

        {/* 투표 섹션 */}
        {showVoteSection && (
          <VoteSection
            voteData={voteData}
            onVoteChange={handleVoteChange}
            isEditMode={true}
          />
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {isEditMode ? "수정하기" : "작성하기"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default WritePost;
