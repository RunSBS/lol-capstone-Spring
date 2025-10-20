import React from 'react';

export default function AttendanceModal({ isOpen, onClose, tokensEarned }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* 출석 보상 아이콘 */}
        <div style={{
          fontSize: '60px',
          marginBottom: '20px',
          color: '#ffd700'
        }}>
          🎁
        </div>

        {/* 제목 */}
        <h2 style={{
          margin: '0 0 15px 0',
          color: '#333',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          출석 보상!
        </h2>

        {/* 설명 */}
        <p style={{
          margin: '0 0 20px 0',
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          오늘 첫 로그인을 축하합니다!<br />
          출석 보상으로 토큰을 지급해드립니다.
        </p>

        {/* 토큰 보상 표시 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px 0',
          border: '2px solid #ffd700'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#333',
            marginBottom: '5px'
          }}>
            획득한 토큰
          </div>
          <div style={{
            fontSize: '32px',
            color: '#ffd700',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            +{tokensEarned}개
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          확인
        </button>
      </div>
    </div>
  );
}
