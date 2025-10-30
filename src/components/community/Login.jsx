import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceModal from "../common/AttendanceModal.jsx";
import { processAttendance } from "../../utils/attendanceUtils.js";

function Login({ onLogin, onShowRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceTokens, setAttendanceTokens] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 백엔드 로그인 API 호출
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // JWT 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('currentUser', formData.username);
        onLogin(formData.username);
        
        // 출석 보상 체크
        const attendanceResult = processAttendance(formData.username);
        if (attendanceResult.attended) {
          setAttendanceTokens(attendanceResult.tokensEarned);
          setShowAttendanceModal(true);
        } else {
          window.dispatchEvent(new Event('loginStateChanged'));
          navigate(-1);
        }
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceModalClose = () => {
    setShowAttendanceModal(false);
    // 팝업이 닫힌 후 페이지 이동
    window.dispatchEvent(new Event('loginStateChanged'));
    navigate(-1);
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
      
      {/* 출석 보상 모달 */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={handleAttendanceModalClose}
        tokensEarned={attendanceTokens}
      />
    </div>
  );
}

export default Login;
