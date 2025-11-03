// RecentGamesSummary.jsx
function RecentGamesSummary({ data }) {
  const total = data?.total ?? 0
  const wins = data?.wins ?? 0
  const losses = data?.losses ?? 0
  const winrate = data?.winrate ?? 0
  const avg = data?.avg ?? {kills:0,deaths:0,assists:0,ratio:0,kp:0}
  const playedChamps = data?.playedChamps ?? []
  const positions = data?.positions ?? []

  // 승률에 따른 원형 차트 그라데이션 계산
  // conic-gradient는 시계 방향으로 진행, 승률%만큼 파란색, 나머지는 빨간색
  const winratePercentage = winrate // 0~100 범위
  const chartBackground = `conic-gradient(var(--color-win) 0deg ${winratePercentage * 3.6}deg, var(--color-loss) ${winratePercentage * 3.6}deg 360deg)`
  
  // 텍스트 색상: 승률이 50% 이상이면 파란색, 미만이면 빨간색
  const textColor = winrate >= 50 ? 'var(--color-win)' : 'var(--color-loss)'

  // KDA 평점에 따른 색상 결정 함수
  // "2.50:1 평점" 형태의 문자열에서 숫자 추출
  const getKdaColor = (kdaString) => {
    const match = kdaString?.match(/^([\d.]+):/);
    if (!match) return 'var(--color-text-light)'; // 기본 회색
    
    const ratio = parseFloat(match[1]);
    if (ratio >= 5) return 'var(--color-win)'; // 5 이상: 파란색
    if (ratio > 3) return 'var(--color-gold)'; // 3 초과: 기본 골드색
    return '#9e9eb1'; // 3 이하: 회색 (평범한 색깔)
  }

  // 승률에 따른 색상 결정 함수
  // "100%" 형태의 문자열에서 숫자 추출
  const getWinrateColor = (winrateString) => {
    const match = winrateString?.match(/(\d+)%/);
    if (!match) return 'var(--color-text-light)'; // 기본 회색
    
    const winrate = parseInt(match[1]);
    if (winrate === 100) return 'var(--color-loss)'; // 100%: 빨간색
    if (winrate >= 51) return 'var(--color-gold)'; // 51%~99%: 노란색
    return 'var(--color-text-light)'; // 50% 이하: 기본 회색
  }

  return (
      <div className="recent-games-summary">
        <div className="summary-body">
          <div className="win-loss-summary">
            <p>{total}전 {wins}승 {losses}패</p>
          </div>
          <div className="stats-container">
            <div 
              className="winrate-chart"
              style={{ background: chartBackground }}
            >
              <span 
                className="winrate-chart-text"
                style={{ color: textColor }}
              >
                {winrate}%
              </span>
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
                {playedChamps.slice(0, 3).map((champ, i) => (
                    <li key={i}>
                      <img src={champ.imageUrl} alt={champ.name} className="champ-icon" />
                      <span 
                        className={`winrate ${champ.winrate === '100%' ? 'winrate-perfect' : ''}`}
                        style={{ color: getWinrateColor(champ.winrate) }}
                      >
                        {champ.winrate}
                      </span>
                      <span className="games">({champ.games})</span>
                      <span className="kda" style={{ color: getKdaColor(champ.kda) }}>{champ.kda}</span>
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
