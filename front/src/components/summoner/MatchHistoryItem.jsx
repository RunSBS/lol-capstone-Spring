// 중단 매치 히스토리 아이템
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MatchDetails from './MatchDetails.jsx'
import { normalizeFromRawParticipants } from '../../data/normalizeFromRawParticipants.js'

function MatchHistoryItem({ matchData, view }) {
  const navigate = useNavigate()
  const { gameType, timeAgo, result, duration, champion = {}, kda, items = [], trinket, teams = [], stats } = matchData || {}
  const [expanded, setExpanded] = useState(false)
  const isWin = result === '승리'
  const kdaRatio = ((kda.kills + kda.assists) / (kda.deaths === 0 ? 1 : kda.deaths)).toFixed(2)
  const team1 = (teams || []).filter(p => p.team === 1)
  const team2 = (teams || []).filter(p => p.team === 2)
  
  // 플레이어 이름 클릭 핸들러
  const handlePlayerNameClick = (player) => {
    const gameName = player.gameName || player.name || ''
    const tagLine = player.tagLine || 'KR1'
    if (gameName && gameName !== '-') {
      const encodedName = encodeURIComponent(`${gameName}#${tagLine}`)
      navigate(`/summoner/${encodedName}`)
    }
  }
  
  // 현재 플레이어 정보 가져오기 (cspm 사용을 위해)
  const currentPlayer = useMemo(() => {
    // matchData가 없거나 유효하지 않으면 null 반환
    if (!matchData || !matchData.id && !matchData.matchId) return null
    
    // detailedPlayers가 있으면 그것 사용, 없으면 normalizeFromRawParticipants로 생성
    const players = Array.isArray(matchData?.detailedPlayers) && matchData.detailedPlayers.length > 0
      ? matchData.detailedPlayers
      : normalizeFromRawParticipants({
          ...matchData,
          gameDurationSec: matchData?.gameDurationSec ?? matchData?.gameDuration ?? 0
        })
    
    // view.puuid로 현재 플레이어 찾기
    if (view?.puuid && matchData?.rawParticipants) {
      const me = matchData.rawParticipants.find(p => p?.puuid === view.puuid)
      if (me) {
        // players 배열에서 현재 플레이어 찾기 (name이나 championName으로 매칭)
        return players.find(p => 
          p.name === (me.summonerName || me.riotIdGameName) || 
          p.champion?.name === me.championName
        )
      }
    }
    // view가 없으면 첫 번째 플레이어 반환 (fallback)
    return players.length > 0 ? players[0] : null
  }, [matchData, view])

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
            {champion.imageUrl && <img src={champion.imageUrl} alt={champion.name || 'champion'} />}
            <span className="level">{champion.level || ''}</span>
          </div>
          <div className="spells-runes">
            <div className="spells">
              {spellIcons.filter(src => src && src.trim()).map((src, i) => (
                <img key={i} src={src} alt={`spell ${i + 1}`} />
              ))}
            </div>
            <div className="runes">
              {runeIcons.filter(src => src && src.trim()).map((src, i) => (
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
          <span>킬관여 {stats.killParticipation}%</span>
          <span>CS {stats.cs} ({currentPlayer?.cspm && !isNaN(currentPlayer.cspm) ? currentPlayer.cspm : stats.csPerMinute || '-'})</span>
        </div>
        <div className="item-build">
          {Array.from({ length: 6 }, (_, i) => items[i] || '').map((item, index) => (
            item && item.trim() ? <img key={index} src={item} alt={`item ${index}`} /> : <div key={index} className="empty-item"></div>
          ))}
          {trinket && trinket.trim() ? <img src={trinket} alt="trinket" className="trinket" /> : <div className="empty-item trinket"></div>}
        </div>
        <div className="player-lists">
          <div className="team">{team1.map((p, i) => {
            const gameName = p.gameName || p.name || ''
            const tagLine = p.tagLine || 'KR1'
            const isClickable = gameName && gameName !== '-'
            return (
              <div key={i} className="player">
                {p.champion && <img src={p.champion} alt={p.name || 'player'}/>}
                <span 
                  className={isClickable ? 'clickable' : ''}
                  onClick={() => isClickable && handlePlayerNameClick(p)}
                  style={isClickable ? { cursor: 'pointer' } : {}}
                >
                  {p.name || ''}
                </span>
              </div>
            )
          })}</div>
          <div className="team">{team2.map((p, i) => {
            const gameName = p.gameName || p.name || ''
            const tagLine = p.tagLine || 'KR1'
            const isClickable = gameName && gameName !== '-'
            return (
              <div key={i} className="player">
                {p.champion && <img src={p.champion} alt={p.name || 'player'}/>}
                <span 
                  className={isClickable ? 'clickable' : ''}
                  onClick={() => isClickable && handlePlayerNameClick(p)}
                  style={isClickable ? { cursor: 'pointer' } : {}}
                >
                  {p.name || ''}
                </span>
              </div>
            )
          })}</div>
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


