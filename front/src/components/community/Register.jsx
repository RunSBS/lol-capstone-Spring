import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/community.css";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 4) {
      alert("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    try {
      // 백엔드 회원가입 API 호출
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다.");
        onRegister();
      } else if (response.status === 409) {
        const errorText = await response.text();
        alert(errorText || "이미 존재하는 사용자입니다.");
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error('Register error:', error);
      alert("회원가입 중 오류가 발생했습니다.");
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
    <div className="auth-container">
      <h2 className="auth-title">회원가입</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label className="auth-label">
            아이디
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="아이디를 입력하세요"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-label">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-label">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요 (4자 이상)"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-label">
            비밀번호 확인
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력하세요"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-buttons">
          <button
            type="submit"
            className="auth-button auth-button-success"
          >
            회원가입
          </button>
          
          <button
            type="button"
            onClick={onRegister}
            className="auth-button auth-button-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
