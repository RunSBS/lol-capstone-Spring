import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 4) {
      alert("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    const usersJson = localStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    const existingUser = users.find(u => u.username === formData.username);
    if (existingUser) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }

    users.push({
      username: formData.username,
      password: formData.password
    });
    
    localStorage.setItem("users", JSON.stringify(users));
    alert("회원가입이 완료되었습니다.");
    onRegister();
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
      <h2>회원가입</h2>
      
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

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요 (4자 이상)"
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
            비밀번호 확인
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력하세요"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4 
            }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            회원가입
          </button>
          
          <button
            type="button"
            onClick={onRegister}
            style={{
              padding: 12,
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

export default Register;
