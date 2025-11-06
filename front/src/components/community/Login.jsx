import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceModal from "../common/AttendanceModal.jsx";
import betApi from "../../data/betApi";
import { processAttendance } from "../../utils/attendanceUtils.js";
import "../../styles/community.css";

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
      const response = await fetch('/auth/login', {
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
        // 전역 로그인 상태 즉시 반영 (App 훅이 바로 작동하도록)
        window.dispatchEvent(new Event('loginStateChanged'));
        
        // 로그인 직후: 오프라인 동안 마감된 내기 사전 조회 → 대기 큐 저장
        try {
          const sinceStored = localStorage.getItem('betLastSeenAt');
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          const since = sinceStored ? (new Date(sinceStored) > new Date(thirtyDaysAgo) ? sinceStored : thirtyDaysAgo) : thirtyDaysAgo;
          const settled = await betApi.getSettledBets(since);
          if (Array.isArray(settled) && settled.length > 0) {
            localStorage.setItem('betPendingSettlements', JSON.stringify(settled));
          }
          // 기준 시각을 현재로 업데이트 (중복 알림 방지)
          localStorage.setItem('betLastSeenAt', new Date().toISOString());
        } catch (prefetchErr) {
          console.warn('정산 알림 사전 조회 실패:', prefetchErr);
        }
        
        // 출석 보상 체크 (백엔드 API 호출)
        try {
          const attendanceResult = await processAttendance(formData.username);
          if (attendanceResult.attended) {
            setAttendanceTokens(attendanceResult.tokensEarned);
            setShowAttendanceModal(true);
          } else {
            window.dispatchEvent(new Event('loginStateChanged'));
            navigate(-1);
          }
        } catch (attendanceError) {
          console.error('출석 보상 체크 실패:', attendanceError);
          // 출석 보상 체크 실패해도 로그인은 유지
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
    <div className="auth-container">
      <h2 className="auth-title">로그인</h2>
      
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
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-buttons">
          <button
            type="submit"
            className="auth-button auth-button-primary"
          >
            로그인
          </button>
        </div>

        <div className="auth-link-container">
          <button
            type="button"
            onClick={onShowRegister}
            className="auth-button-outline"
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
