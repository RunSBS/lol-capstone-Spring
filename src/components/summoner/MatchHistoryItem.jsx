// 중단 매치 히스토리 아이템 (개선판)
import { useState } from 'react'
import MatchDetails from './MatchDetails.jsx'

// 공통: 이미지 실패 시 빈칸으로 바꾸는 핸들러
function onImgErrorToEmpty(e) {
  const img = e.currentTarget
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent && !parent.classList.contains('empty-item')) {
    parent.classList.add('empty-item')
  }
}

function SafeImg({ src, alt, className }) {
  if (!src) {
    // src가 없으면 아예 <img> 렌더하지 않고 빈칸
    return <div className={`empty-item ${className || ''}`} aria-label="빈 슬롯" />
  }
  return (
      <div className={className}>
        <img src={src} alt={alt} onError={onImgErrorToEmpty} draggable="false" loading="lazy" />
      </div>
  )
}

function MatchHistoryItem({ matchData }) {
  const { id, gameType, timeAgo, result, duration, champion, kda, items, trinket, teams, stats } = matchData
  const [expanded, setExpanded] = useState(false)
  const isWin = result === '승리'
  const kdaRatio = ((kda.kills + kda.assists) / (kda.deaths === 0 ? 1 : kda.deaths)).toFixed(2)
  const team1 = teams.filter(p => p.team === 1)
  const team2 = teams.filter(p => p.team === 2)

  // 아이템 0/undefined 처리: 이미지가 없으면 빈칸으로 보이게 SafeImg 사용
  const buildItem = (itemUrl, idx, extraClass = '') => {
    const hasItem = typeof itemUrl === 'string' && itemUrl.length > 0
    return hasItem
        ? <SafeImg key={idx} src={itemUrl} alt={`item ${idx}`} className={`item-slot ${extraClass}`} />
        : <div key={idx} className={`empty-item item-slot ${extraClass}`} aria-label="빈 슬롯" />
  }

  return (
      <div className="match-item-wrapper" data-match-id={id}>
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
              {/* 챔피언 이미지 실패 시에도 빈칸 처리 */}
              <SafeImg src={champion.imageUrl} alt={champion.name} className="champion-img" />
              <span className="level">{champion.level}</span>
            </div>

            <div className="spells-runes">
              <div className="spells">
                <SafeImg src={champion.spells?.[0]} alt="spell 1" className="spell-slot" />
                <SafeImg src={champion.spells?.[1]} alt="spell 2" className="spell-slot" />
              </div>
              <div className="runes">
                <SafeImg src={champion.runes?.[0]} alt="rune 1" className="rune-slot" />
                <SafeImg src={champion.runes?.[1]} alt="rune 2" className="rune-slot" />
              </div>
            </div>

            <div className="kda-section">
              <div className="kda">
                <span className="kills">{kda.kills}</span> / <span className="deaths">{kda.deaths}</span> / <span className="assists">{kda.assists}</span>
              </div>
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
            {/* 앞 6칸 */}
            {items.slice(0, 6).map((itemUrl, index) => buildItem(itemUrl, index))}
            {/* 장신구(trinket) */}
            {buildItem(trinket, 'trinket', 'trinket')}
          </div>

          <div className="player-lists">
            <div className="team">
              {team1.map((p, i) => (
                  <div key={i} className="player">
                    <SafeImg src={p.champion} alt={p.name} className="player-champion" />
                    <span>{p.name}</span>
                  </div>
              ))}
            </div>
            <div className="team">
              {team2.map((p, i) => (
                  <div key={i} className="player">
                    <SafeImg src={p.champion} alt={p.name} className="player-champion" />
                    <span>{p.name}</span>
                  </div>
              ))}
            </div>
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
