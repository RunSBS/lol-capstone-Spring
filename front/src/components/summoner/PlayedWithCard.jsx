// 같은 팀으로 게임한 소환사들 (최근 게임)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function PlayedWithCard({ data }) {
  const navigate = useNavigate()
  const [ddVer, setDdVer] = useState('15.18.1')
  
  useEffect(() => {
    // Data Dragon 버전 로드
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(res => res.json())
      .then(arr => {
        if (Array.isArray(arr) && arr.length > 0) {
          setDdVer(arr[0])
        }
      })
      .catch(() => {})
  }, [])
  
  // 데이터가 없거나 빈 배열인 경우 디폴트 데이터 사용
  const displayData = data && data.length > 0 ? data : []
  
  // 프로필 아이콘 URL 생성 함수
  const getProfileIconUrl = (player) => {
    if (player.iconUrl) {
      return player.iconUrl
    }
    // iconUrl이 없으면 기본 프로필 아이콘 사용
    return `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/5426.png`
  }
  
  // 소환사 이름 클릭 핸들러
  const handlePlayerNameClick = (player) => {
    const gameName = player.name || ''
    const tagLine = player.tag || 'KR1'
    if (gameName && gameName !== '-') {
      const encodedName = encodeURIComponent(`${gameName}#${tagLine}`)
      navigate(`/summoner/${encodedName}`)
    }
  }
  
  return (
    <div className="info-card played-with-box">
      <h3>같은 팀으로 게임한 소환사들 (최근 게임)</h3>
      <ul className="played-with-list">
        {displayData.length > 0 ? (
          displayData.map((player, index) => (
            <li key={index}>
              <img src={getProfileIconUrl(player)} alt={player.name || 'player'} onError={(e) => {
                // 프로필 아이콘 로드 실패 시 기본 아이콘으로 대체
                e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/5426.png`
              }} />
              <div className="player-info">
                <p className="player-name-tag">
                  <span 
                    className="clickable" 
                    onClick={() => handlePlayerNameClick(player)}
                    style={{ cursor: 'pointer' }}
                  >
                    {player.name}
                  </span>
                  {' '}
                  <span>{player.tag}</span>
                </p>
                <p className="player-level">레벨 {player.level}</p>
              </div>
              <div className="player-stats">
                <p className="player-games">{player.games}</p>
                <p className="player-winrate" style={{color: player.winrate >= 60 ? 'var(--color-loss)' : player.winrate >= 50 ? 'var(--color-win)' : 'var(--color-text-light)' }}>{player.winrate}%</p>
              </div>
            </li>
          ))
        ) : (
          <li className="no-data">
            <p>함께 플레이한 소환사 데이터를 불러올 수 없습니다.</p>
          </li>
        )}
      </ul>
    </div>
  )
}

export default PlayedWithCard


