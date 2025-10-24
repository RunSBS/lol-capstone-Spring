// RecentGamesSummary.jsx
function RecentGamesSummary({ data }) {
  const total = data?.total ?? 0
  const wins = data?.wins ?? 0
  const losses = data?.losses ?? 0
  const winrate = data?.winrate ?? 0
  const avg = data?.avg ?? {kills:0,deaths:0,assists:0,ratio:0,kp:0}
  const playedChamps = data?.playedChamps ?? []
  const positions = data?.positions ?? []

  return (
      <div className="recent-games-summary">
        <div className="summary-body">
          <div className="win-loss-summary">
            <p>{total}전 {wins}승 {losses}패</p>
          </div>
          <div className="stats-container">
            <div className="winrate-chart">
              <span className="winrate-chart-text">{winrate}%</span>
            </div>
            <div className="overall-kda">
              <p className="kda-numbers">
                <span className="k-d-a">{avg.kills}</span> / <span className="k-d-a" style={{color: 'var(--color-loss)'}}>{avg.deaths}</span> / <span className="k-d-a">{avg.assists}</span>
              </p>
              <p className="kda-ratio"><span className="ratio-value">{avg.ratio} : 1</span></p>
              <p className="kill-participation">킬관여 {avg.kp}%</p>
            </div>

            <div className="played-champions-summary">
              <ul>
                {playedChamps.map((champ, i) => (
                    <li key={i}>
                      <img src={champ.imageUrl} alt={champ.name} className="champ-icon" />
                      <span className={`winrate ${champ.winrate === '100%' ? 'winrate-perfect' : ''}`}>{champ.winrate}</span>
                      <span className="games">({champ.games})</span>
                      <span className="kda">{champ.kda}</span>
                    </li>
                ))}
              </ul>
            </div>

            <div className="preferred-positions">
              <p className="positions-title">선호 포지션 (랭크)</p>
              <div className="positions-chart">
                {positions.map((pos, i) => (
                    <div key={i} className="position-bar">
                      <div className="position-bar-inner" style={{ height: `${pos.percentage}%` }}></div>
                      <img src={pos.icon} alt={pos.role} className="role-icon"/>
                    </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
  )
}

export default RecentGamesSummary
