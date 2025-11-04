// 매치 상세 표
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {normalizeFromRawParticipants} from "../../data/normalizeFromRawParticipants.js";
import { loadRuneMap } from '../../data/ddragon.js'
import { fetchMatchDetail } from '../../data/api.js'

function MatchDetails({ matchData }) {
  const navigate = useNavigate()
  
  // 룬 맵 선로딩: 키스톤 아이콘이 빈칸으로 나오는 현상 방지
  const [runesReady, setRunesReady] = useState(false)
  const [basePlayers, setBasePlayers] = useState([])
  
  useEffect(() => {
    let mounted = true
    const ver = matchData?.ddVer || '15.18.1'
    ;(async () => {
      try { 
        // 룬 매핑을 먼저 로드
        await loadRuneMap(ver)
        if (!mounted) return
        
        // 룬 매핑 로드 후 플레이어 데이터 정규화
        const normalizedMatchData = {
          ...matchData,
          gameDurationSec: matchData?.gameDurationSec ?? matchData?.gameDuration ?? 0
        }
        const players = Array.isArray(matchData?.detailedPlayers) && matchData.detailedPlayers.length
            ? matchData.detailedPlayers
            : normalizeFromRawParticipants(normalizedMatchData)
        
        if (mounted) {
          setBasePlayers(players)
          setRunesReady(v => !v) // 재렌더 트리거
        }
      } catch (e) {
        console.warn('Failed to load rune map:', e)
        // 룬 매핑 로드 실패 시에도 플레이어 데이터는 정규화
        if (mounted) {
          const normalizedMatchData = {
            ...matchData,
            gameDurationSec: matchData?.gameDurationSec ?? matchData?.gameDuration ?? 0
          }
          const players = Array.isArray(matchData?.detailedPlayers) && matchData.detailedPlayers.length
              ? matchData.detailedPlayers
              : normalizeFromRawParticipants(normalizedMatchData)
          setBasePlayers(players)
          setRunesReady(v => !v)
        }
      }
    })()
    return () => { mounted = false }
  }, [matchData?.ddVer, matchData?.id, matchData?.matchId])

  // 상세 데이터(백엔드 detail) 로드 상태
  const [detailedPlayers, setDetailedPlayers] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState(null)

  // matchData가 변경되면 상세 데이터 초기화
  useEffect(() => {
    setDetailedPlayers(null)
    setLoadingDetail(false)
    setError(null)
    setBasePlayers([]) // basePlayers도 초기화
  }, [matchData?.id, matchData?.matchId])
  

  // 필요 시 상세 호출: 현재 데이터에 피해량이 전부 0이면 detail API 조회 시도
  useEffect(() => {
    let mounted = true
    const allZero = (Array.isArray(basePlayers) ? basePlayers : []).every(p => !p?.damageDealt)
    const matchId = matchData?.id || matchData?.matchId
    if (!matchId || !allZero || loadingDetail || detailedPlayers || basePlayers.length === 0) return
    setLoadingDetail(true)
    setError(null)
    ;(async () => {
      try {
        const ver = matchData?.ddVer || '15.18.1'
        // 룬 매핑이 로드되지 않았다면 먼저 로드
        await loadRuneMap(ver)
        
        const detail = await fetchMatchDetail(matchId, false)
        // detail.participants를 normalize에 맞게 주입 (룬 매핑 로드 후)
        const enriched = normalizeFromRawParticipants({
          ...matchData,
          // rawParticipants가 있으면 detail participants가 무시되는 문제 방지
          rawParticipants: null,
          participants: Array.isArray(detail?.participants) ? detail.participants : [],
          gameDuration: detail?.gameDuration ?? matchData?.gameDuration,
          gameDurationSec: detail?.gameDuration ?? matchData?.gameDurationSec ?? matchData?.gameDuration ?? 0,
          ddVer: matchData?.ddVer,
          teams: Array.isArray(detail?.teams) ? detail.teams : (matchData?.teams || []),
        })
        if (mounted) setDetailedPlayers(enriched)
        try { console.debug('[DEBUG_LOG] MatchDetails loaded detail for', matchId) } catch {}
      } catch (e) {
        if (mounted) setError(String(e))
        try { console.debug('[DEBUG_LOG] MatchDetails detail fetch failed', String(e)) } catch {}
      } finally {
        if (mounted) setLoadingDetail(false)
      }
    })()
    return () => { mounted = false }
  }, [basePlayers, matchData?.id, matchData?.matchId, matchData?.ddVer])

  const players = Array.isArray(detailedPlayers) && detailedPlayers.length ? detailedPlayers : basePlayers

  const lossTeam = players.filter(p => p.team === 'loss')
  const winTeam = players.filter(p => p.team === 'win')
  const lossSideLabel = (lossTeam[0]?.side === 'blue') ? '블루팀' : (lossTeam[0]?.side === 'red') ? '레드팀' : ''
  const winSideLabel  = (winTeam[0]?.side === 'blue') ? '블루팀' : (winTeam[0]?.side === 'red') ? '레드팀' : ''
  // 그래프 최대값: 해당 게임에서 가장 큰 가한 피해량(최소 1 보장)
  const maxDamage = Math.max(...[...lossTeam, ...winTeam].map(p => p.damageDealt || 0), 1)

  // 골드 값 가져오기 (백엔드에서 제공하는 실제 값 사용)
  const getGoldForPlayer = (player) => {
    if (typeof player.gold === 'number' && player.gold > 0) {
      return player.gold
    }
    // 백엔드에서 골드 데이터가 없는 경우 0 반환
    return 0
  }

  // 플레이어 이름 클릭 핸들러
  const handlePlayerNameClick = (player) => {
    const gameName = player.gameName || player.name || ''
    const tagLine = player.tagLine || 'KR1'
    if (gameName && gameName !== '-') {
      const encodedName = encodeURIComponent(`${gameName}#${tagLine}`)
      navigate(`/summoner/${encodedName}`)
    }
  }

  const renderPlayerRow = (player, index) => {
    // 아이템 6칸을 항상 채우기 위해 빈 슬롯으로 패딩
    const itemSlots = Array.from({ length: 6 }, (_, i) => (player?.items && player.items[i]) || '');
    const gameName = player.gameName || player.name || ''
    const tagLine = player.tagLine || 'KR1'
    const isClickable = gameName && gameName !== '-'
    
    return (
      <div key={index} className={`player-row ${player.team === 'win' ? 'win-team' : 'loss-team'}`}>
        <div className="player-identity">
          <div className="champ-icon-wrapper">
            {player.champion?.imageUrl && <img className="champ-icon" src={player.champion.imageUrl} alt={player.champion.name || 'champion'} />}
            <span className="champ-level">{player.champion?.level || ''}</span>
          </div>
          <div className="spells-runes">
            <div className="spells">
              {player.spells?.[0] && <img src={player.spells[0]} alt="spell 1" />}
              {player.spells?.[1] && <img src={player.spells[1]} alt="spell 2" />}
            </div>
            <div className="runes">
              {(Array.isArray(player.runes) ? player.runes : [])
                .filter(src => src && src.trim() && src !== 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')
                .map((src, idx) => (
                  <img key={idx} src={src} alt={`rune ${idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                ))}
            </div>
          </div>
          <div className="player-name-tier">
            <span 
              className={`player-name ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && handlePlayerNameClick(player)}
              style={isClickable ? { cursor: 'pointer' } : {}}
            >
              {player.name}
            </span>
            <span className="player-tier">{player.tier}</span>
          </div>
        </div>
        <div className="kda-details">
          <p className="kda-text">{player.kda} ({player.kp})</p>
          <p className="kda-ratio-text" style={{color: player.kdaRatio === '4.43:1' || player.kdaRatio === '4.29:1' ? 'var(--color-win)' : 'var(--color-text-light)'}}>{player.kdaRatio}</p>
        </div>
        <div className="damage-details">
          <span className="damage-values">{Number(player.damageDealt || 0).toLocaleString()}</span>
          <div className="damage-bar-container">
            <div
              className="damage-bar dealt"
              style={{ width: `${Math.min(100, Math.max(0, ((player.damageDealt || 0) / maxDamage) * 100))}%` }}
            ></div>
          </div>
          {/* 받은 피해 보조 표기 */}
          <div className="damage-taken-text">{Number(player.damageTaken || 0).toLocaleString()}</div>
        </div>
        <div className="cs-details">
          <p>{player.cs}</p>
          <p className="cspm">분당 {player.cspm && !isNaN(player.cspm) ? player.cspm : '-'}</p>
        </div>
        <div className="gold-details">
          <p>{getGoldForPlayer(player).toLocaleString()}</p>
        </div>
        <div className="items-details">
          {itemSlots.map((item, i) => (
            item && item.trim() ? <img key={i} src={item} alt={`item ${i}`} /> : <div key={i} className="empty-item"></div>
          ))}
          {player.trinket && player.trinket.trim() ? <img className="trinket" src={player.trinket} alt="trinket" /> : <div className="empty-item trinket"></div>}
        </div>
      </div>
    )
  }

  return (
    <div className="match-details-container">
      {loadingDetail && (
        <div style={{ padding: '20px', textAlign: 'center' }}>상세 정보를 불러오는 중...</div>
      )}
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-loss)' }}>
          상세 정보를 불러올 수 없습니다: {error}
        </div>
      )}
      {!loadingDetail && !error && (
      <div className="team-table">
        <div className="table-header">
          <span className="header-item">패배 ({lossSideLabel || '-'} )</span>
          <span className="header-item">KDA</span>
          <span className="header-item">피해량</span>
          <span className="header-item">CS</span>
          <span className="header-item">골드</span>
          <span className="header-item">아이템</span>
        </div>
        {lossTeam.map(renderPlayerRow)}
        <div className="table-header" style={{borderTop: '1px solid var(--color-border)', marginTop: '5px'}}>
          <span className="header-item">승리 ({winSideLabel || '-'} )</span>
          <span className="header-item">KDA</span>
          <span className="header-item">피해량</span>
          <span className="header-item">CS</span>
          <span className="header-item">골드</span>
          <span className="header-item">아이템</span>
        </div>
        {winTeam.map(renderPlayerRow)}
      </div>
      )}
    </div>
  )
}

export default MatchDetails
