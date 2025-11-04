import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backendApi from '../../data/backendApi';
import '../../styles/HomePage.css';

function TokenRanking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      // 백엔드 API에서 토큰 순위 가져오기
      const backendRankings = await backendApi.getTokenRanking();
      
      if (backendRankings && backendRankings.length > 0) {
        // 백엔드 데이터 사용 (username, tokens)
        const formattedRankings = backendRankings.map(user => ({
          username: user.username,
          tokens: user.tokens || 0,
          avatar: null // 백엔드에서 아바타 정보가 없으므로 null
        }));
        setRankings(formattedRankings);
      } else {
        // 백엔드에서 데이터가 없으면 localStorage에서 가져오기 (fallback)
        try {
          const usersJson = localStorage.getItem("users") || "[]";
          const users = JSON.parse(usersJson);
          
          // 토큰 순으로 정렬 (내림차순)
          const sortedUsers = users
            .map(user => ({
              username: user.username,
              tokens: user.tokens || 0,
              avatar: user.avatar || null
            }))
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, 10); // 상위 10명만

          setRankings(sortedUsers);
        } catch (localError) {
          console.error('로컬 순위 로드 실패:', localError);
          setRankings([]);
        }
      }
    } catch (error) {
      console.error('순위 로드 실패:', error);
      // 에러 발생 시 localStorage에서 가져오기 (fallback)
      try {
        const usersJson = localStorage.getItem("users") || "[]";
        const users = JSON.parse(usersJson);
        
        const sortedUsers = users
          .map(user => ({
            username: user.username,
            tokens: user.tokens || 0,
            avatar: user.avatar || null
          }))
          .sort((a, b) => b.tokens - a.tokens)
          .slice(0, 10);

        setRankings(sortedUsers);
      } catch (localError) {
        console.error('로컬 순위 로드 실패:', localError);
        setRankings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}위`;
    }
  };

  const getPodiumData = (rank) => {
    const data = {
      1: {
        backgroundColor: '#ffd700',
        height: '180px',
        order: 2,
        boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)',
        border: '3px solid #ffd700'
      },
      2: {
        backgroundColor: '#c0c0c0',
        height: '130px',
        order: 1,
        boxShadow: '0 6px 15px rgba(192, 192, 192, 0.4)',
        border: '3px solid #c0c0c0'
      },
      3: {
        backgroundColor: '#cd7f32',
        height: '100px',
        order: 3,
        boxShadow: '0 4px 10px rgba(205, 127, 50, 0.4)',
        border: '3px solid #cd7f32'
      }
    };
    return data[rank] || {};
  };

  if (loading) {
    return (
      <div className="token-ranking-loading">
        순위 로딩 중...
      </div>
    );
  }

  return (
    <div className="token-ranking-container">
      <h3 className="token-ranking-title">
        🏆 토큰 보유 순위
      </h3>

      {/* 1-3위 단상 */}
      {rankings.length >= 3 && (
        <div className="token-ranking-podium-container">
          {/* 단상 컨테이너 */}
          <div className="token-ranking-podium-wrapper">
            {[2, 1, 3].map(rank => {
              const user = rankings[rank - 1];
              if (!user) return null;
              
              const podiumData = getPodiumData(rank);
              
              // 바닥선을 맞추기 위한 margin-top 계산 (최대 높이 120px 기준)
              const maxHeight = 120; // 1등의 높이
              const currentHeight = parseInt(podiumData.height);
              const marginTop = maxHeight - currentHeight;
              
              return (
                <div 
                  key={rank} 
                  className="token-ranking-podium-item"
                  style={{
                    marginTop: `${marginTop}px`
                  }}
                >
                  {/* 단상 기둥 */}
                  <div 
                    className="token-ranking-podium-column"
                    style={{
                      height: podiumData.height,
                      backgroundColor: podiumData.backgroundColor,
                      border: podiumData.border,
                      boxShadow: podiumData.boxShadow
                    }}
                  >
                    {/* 순위 아이콘 */}
                    <div className="token-ranking-rank-icon">
                      {getRankIcon(rank)}
                    </div>
                    
                    {/* 프로필 이미지 */}
                    <div className="token-ranking-avatar-container">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                        />
                      ) : (
                        <div className="token-ranking-avatar-placeholder">
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 단상 밑부분 (모든 단상이 같은 높이) */}
                  <div 
                    className="token-ranking-podium-bottom"
                    style={{
                      backgroundColor: podiumData.backgroundColor,
                      border: podiumData.border,
                      boxShadow: podiumData.boxShadow
                    }}
                  />
                  
                  {/* 닉네임 (단상 밖에 배치) */}
                  <Link
                    to={`/user/${encodeURIComponent(user.username)}`}
                    className="token-ranking-username-link"
                  >
                    {user.username}
                  </Link>
                  
                  {/* 토큰 수 */}
                  <div className="token-ranking-token-count">
                    {user.tokens.toLocaleString()}개
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4-10위 목록 */}
      {rankings.length > 3 && (
        <div className="token-ranking-list-section">
          <h4 className="token-ranking-list-title">
            4위 ~ 10위
          </h4>
          <div className="token-ranking-list">
            {rankings.slice(3).map((user, index) => (
              <Link
                key={user.username}
                to={`/user/${encodeURIComponent(user.username)}`}
                className="token-ranking-list-item"
              >
                {/* 순위 */}
                <div className="token-ranking-rank-number">
                  {index + 4}위
                </div>
                
                {/* 프로필 이미지 */}
                <div className="token-ranking-list-avatar-container">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                    />
                  ) : (
                    <div className="token-ranking-list-avatar-placeholder">
                      👤
                    </div>
                  )}
                </div>
                
                {/* 닉네임과 토큰 */}
                <div className="token-ranking-user-info">
                  <div className="token-ranking-user-name">
                    {user.username}
                  </div>
                  <div className="token-ranking-user-tokens">
                    {user.tokens.toLocaleString()} 토큰
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {rankings.length === 0 && (
        <div className="token-ranking-empty">
          순위 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

export default TokenRanking;
