import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import boardApi from "../../data/communityApi";

function WritePost({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "free",
    tags: []
  });

  // 수정 모드인지 확인
  const postToEdit = location.state?.postToEdit;
  const isEditMode = !!postToEdit;

  useEffect(() => {
    if (isEditMode && postToEdit) {
      setFormData({
        title: postToEdit.title || "",
        content: postToEdit.content || "",
        category: postToEdit.category || "free",
        tags: postToEdit.tags || []
      });
    }
  }, [isEditMode, postToEdit]);

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

    try {
      if (isEditMode) {
        await boardApi.updatePost(postToEdit.id, {
          ...formData,
          writer: currentUser
        });
        alert("글이 수정되었습니다.");
      } else {
        await boardApi.createPost({
          ...formData,
          writer: currentUser
        });
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
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요"
            rows={15}
            style={{ 
              width: "100%", 
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4,
              resize: "vertical"
            }}
            required
          />
        </div>

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
