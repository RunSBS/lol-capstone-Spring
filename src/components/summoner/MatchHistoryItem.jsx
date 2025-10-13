// 중단 매치 히스토리 아이템
import { useState, useMemo } from 'react'
import MatchDetails from './MatchDetails.jsx'

function MatchHistoryItem({ matchData }) {
  const { gameType, timeAgo, result, duration, champion = {}, kda, items = [], trinket, teams = [], stats } = matchData || {}
  const [expanded, setExpanded] = useState(false)
  const isWin = result === '승리'
  const kdaRatio = ((kda.kills + kda.assists) / (kda.deaths === 0 ? 1 : kda.deaths)).toFixed(2)
  const team1 = (teams || []).filter(p => p.team === 1)
  const team2 = (teams || []).filter(p => p.team === 2)

  // 안전한 아이콘 렌더링: falsy 값/숫자 ID가 올 경우를 대비
  const spellIcons = useMemo(() => {
    const s = Array.isArray(champion.spells) ? champion.spells : []
    return s.filter(Boolean)
  }, [champion.spells])

  const runeIcons = useMemo(() => {
    const r = Array.isArray(champion.runes) ? champion.runes : []
    return r.filter(Boolean)
  }, [champion.runes])

  return (
    <div className="match-item-wrapper">
      <div className={`match-item ${isWin ? 'win' : 'loss'}`}>
        <div className="game-info">
          <span className="game-type">{gameType}</span>
          <span className="time-ago">{timeAgo}</span>
          <div className="separator"></div>
          <span className={`result ${isWin ? 'win-text' : 'loss-text'}`}>{result}</span>
          <span className="duration">{duration}</span>
        </div>
        <div className="champion-info">
          <div className="champion-portrait">
            <img src={champion.imageUrl} alt={champion.name} />
            <span className="level">{champion.level}</span>
          </div>
          <div className="spells-runes">
            <div className="spells">
              {spellIcons.map((src, i) => (
                <img key={i} src={src} alt={`spell ${i + 1}`} />
              ))}
            </div>
            <div className="runes">
              {runeIcons.map((src, i) => (
                <img key={i} src={src} alt={`rune ${i + 1}`} />
              ))}
            </div>
          </div>
          <div className="kda-section">
            <div className="kda"><span className="kills">{kda.kills}</span> / <span className="deaths">{kda.deaths}</span> / <span className="assists">{kda.assists}</span></div>
            <div className="kda-ratio">{kdaRatio}:1 평점</div>
          </div>
        </div>
        <div className="misc-stats">
          <span>라인전 33 : 67</span>
          <span>킬관여 {stats.killParticipation}%</span>
          <span>CS {stats.cs} ({stats.csPerMinute})</span>
          <span>{stats.rank}</span>
        </div>
        <div className="item-build">
          {Array.from({ length: 6 }, (_, i) => items[i] || '').map((item, index) => (
            item ? <img key={index} src={item} alt={`item ${index}`} /> : <div key={index} className="empty-item"></div>
          ))}
          {trinket ? <img src={trinket} alt="trinket" className="trinket" /> : <div className="empty-item trinket"></div>}
        </div>
        <div className="player-lists">
          <div className="team">{team1.map((p, i) => <div key={i} className="player"><img src={p.champion} alt={p.name}/><span>{p.name}</span></div>)}</div>
          <div className="team">{team2.map((p, i) => <div key={i} className="player"><img src={p.champion} alt={p.name}/><span>{p.name}</span></div>)}</div>
        </div>
        <div className="details-toggle" onClick={() => setExpanded(!expanded)}>
          <div className={expanded ? 'arrow-up' : 'arrow-down'}></div>
        </div>
      </div>
      {expanded && <MatchDetails matchData={matchData} />}
    </div>
  )
}

export default MatchHistoryItem


