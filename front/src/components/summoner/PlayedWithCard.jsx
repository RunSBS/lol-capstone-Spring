// 같은 팀으로 게임한 소환사들 (최근 게임)
function PlayedWithCard({ data }) {
  return (
    <div className="info-card played-with-box">
      <h3>같은 팀으로 게임한 소환사들 (최근 게임)</h3>
      <ul className="played-with-list">
        {data.map((player, index) => (
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
        ))}
      </ul>
    </div>
  )
}

export default PlayedWithCard


