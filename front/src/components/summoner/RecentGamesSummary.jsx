// 중단 최근 게임 요약 섹션 (아직 구현 안함)
function RecentGamesSummary({ data }) {
  return (
    <div className="recent-games-summary">
      <div className="summary-body">
        <div className="win-loss-summary">
          <p>21전 14승 7패</p>
        </div>
        <div className="stats-container">
          <div className="winrate-chart">
            <span className="winrate-chart-text">67%</span>
          </div>
          <div className="overall-kda">
            <p className="kda-numbers"><span className="k-d-a">10.2</span> / <span className="k-d-a" style={{color: 'var(--color-loss)'}}>6.2</span> / <span className="k-d-a">11.3</span></p>
            <p className="kda-ratio"><span className="ratio-value">3.47 : 1</span></p>
            <p className="kill-participation">킬관여 52%</p>
          </div>
          <div className="played-champions-summary">
            <ul>
              {data.playedChamps.map((champ, i) => (
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
              {data.positions.map((pos, i) => (
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


