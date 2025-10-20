import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function loadUser(username) {
  const usersJson = localStorage.getItem("users") || "[]";
  const users = JSON.parse(usersJson);
  const user = users.find(u => u.username === username) || { username, password: "", bio: "", tokens: 0, avatar: "" };
  
  // admin1 계정의 토큰을 9999로 설정
  if (username === "admin1") {
    user.tokens = 9999;
  }
  
  return user;
}

function TokenRanking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = () => {
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
    } catch (error) {
      console.error('순위 로드 실패:', error);
      setRankings([]);
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
        height: '120px',
        order: 2,
        boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)',
        border: '3px solid #ffd700'
      },
      2: {
        backgroundColor: '#c0c0c0',
        height: '100px',
        order: 1,
        boxShadow: '0 6px 15px rgba(192, 192, 192, 0.4)',
        border: '3px solid #c0c0c0'
      },
      3: {
        backgroundColor: '#cd7f32',
        height: '80px',
        order: 3,
        boxShadow: '0 4px 10px rgba(205, 127, 50, 0.4)',
        border: '3px solid #cd7f32'
      }
    };
    return data[rank] || {};
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        순위 로딩 중...
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px', 
      padding: '20px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333', 
        fontSize: '18px',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: '20px 0 40px 0'
      }}>
        🏆 토큰 보유 순위
      </h3>

      {/* 1-3위 단상 */}
      {rankings.length >= 3 && (
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginTop: '40px'
        }}>
          {/* 단상 컨테이너 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '20px',
            position: 'relative',
            height: '120px',
            marginBottom: '20px',
            marginTop: '20px'
          }}>
            {[2, 1, 3].map(rank => {
              const user = rankings[rank - 1];
              if (!user) return null;
              
              const podiumData = getPodiumData(rank);
              
              return (
                <div key={rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* 단상 기둥 */}
                  <div style={{
                    width: '80px',
                    height: podiumData.height,
                    backgroundColor: podiumData.backgroundColor,
                    border: podiumData.border,
                    borderRadius: '8px 8px 0 0',
                    boxShadow: podiumData.boxShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '10px 5px',
                    position: 'relative'
                  }}>
                    {/* 순위 아이콘 */}
                    <div style={{
                      fontSize: '20px',
                      marginBottom: '5px',
                      fontWeight: 'bold'
                    }}>
                      {getRankIcon(rank)}
                    </div>
                    
                    {/* 프로필 이미지 */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '5px',
                      border: '2px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6c757d',
                          fontSize: '16px'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 단상 밑부분 (모든 단상이 같은 높이) */}
                  <div style={{
                    width: '80px',
                    height: '20px',
                    backgroundColor: podiumData.backgroundColor,
                    border: podiumData.border,
                    borderRadius: '0 0 8px 8px',
                    boxShadow: podiumData.boxShadow
                  }} />
                  
                  {/* 닉네임 (단상 밖에 배치) */}
                  <Link
                    to={`/user/${encodeURIComponent(user.username)}`}
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#333',
                      textAlign: 'center',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.2)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      marginTop: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = '#007bff';
                      e.target.style.backgroundColor = 'rgba(0,123,255,0.1)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = '#333';
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {user.username}
                  </Link>
                  
                  {/* 토큰 수 */}
                  <div style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    color: '#666',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
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
        <div>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#555', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            4위 ~ 10위
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rankings.slice(3).map((user, index) => (
              <Link
                key={user.username}
                to={`/user/${encodeURIComponent(user.username)}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.transform = 'translateX(2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                {/* 순위 */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  minWidth: '30px',
                  textAlign: 'center'
                }}>
                  {index + 4}위
                </div>
                
                {/* 프로필 이미지 */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 10px',
                  border: '2px solid #e9ecef'
                }}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      👤
                    </div>
                  )}
                </div>
                
                {/* 닉네임과 토큰 */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '2px'
                  }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#666'
                  }}>
                    {user.tokens.toLocaleString()} 토큰
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {rankings.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          padding: '20px',
          fontSize: '14px'
        }}>
          순위 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

export default TokenRanking;
