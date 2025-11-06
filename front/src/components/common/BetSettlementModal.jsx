import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/community.css';

function BetSettlementModal({ bet, onClose }) {
  const navigate = useNavigate();
  
  if (!bet) return null;
  
  const handleViewPost = () => {
    navigate(`/community/post/${bet.postId}`);
    onClose();
  };
  
  const winnerText = bet.winnerOption === 'A' ? bet.optionA : bet.optionB;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎉 투표가 마감되었습니다!</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p><strong>{bet.betTitle}</strong></p>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <p>승리 옵션: <strong style={{ color: '#28a745' }}>{winnerText}</strong></p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              정산 시각: {new Date(bet.settledAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={handleViewPost} className="btn-primary">
            게시글 보기
          </button>
          <button onClick={onClose} className="btn-secondary">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default BetSettlementModal;

