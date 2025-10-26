// 같은 팀으로 게임한 소환사들 (최근 게임)
function PlayedWithCard({ data }) {
  // 데이터가 없거나 빈 배열인 경우 디폴트 데이터 사용
  const displayData = data && data.length > 0 ? data : []
  return (
    <div className="info-card played-with-box">
      <h3>같은 팀으로 게임한 소환사들 (최근 게임)</h3>
      <ul className="played-with-list">
        {displayData.length > 0 ? (
          displayData.map((player, index) => (
            <li key={index}>
              <img src={player.iconUrl} alt={player.name} />
              <div className="player-info">
                <p className="player-name-tag">{player.name} <span>{player.tag}</span></p>
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


