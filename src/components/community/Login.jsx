import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin, onShowRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const usersJson = localStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    const user = users.find(
      u => u.username === formData.username && u.password === formData.password
    );
    
    if (user) {
      localStorage.setItem("currentUser", formData.username);
      onLogin(formData.username);
      // 로그인 상태 변경 이벤트 발생
      window.dispatchEvent(new Event('loginStateChanged'));
      navigate(-1); // 이전 페이지로 돌아가기
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
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
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h2>로그인</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            아이디
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="아이디를 입력하세요"
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
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4 
            }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            로그인
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={onShowRegister}
            style={{
              padding: 8,
              backgroundColor: "transparent",
              color: "#007bff",
              border: "1px solid #007bff",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
