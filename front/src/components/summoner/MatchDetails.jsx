// 매치 상세 표
import { useEffect, useState } from 'react'
import {normalizeFromRawParticipants} from "../../data/normalizeFromRawParticipants.js";
import { loadRuneMap } from '../../data/ddragon.js'
import { fetchMatchDetail } from '../../data/api.js'

function MatchDetails({ matchData }) {
  const matchId = matchData?.id || matchData?.matchId
  
  // 룬 맵 선로딩: 키스톤 아이콘이 빈칸으로 나오는 현상 방지
  const [runesReady, setRunesReady] = useState(false)
  useEffect(() => {
    let mounted = true
    const ver = matchData?.ddVer || '15.18.1'
    ;(async () => {
      try { await loadRuneMap(ver) } catch {}
      if (mounted) setRunesReady(v => !v) // 재렌더 트리거
    })()
    return () => { mounted = false }
  }, [matchData?.ddVer])

  // 상세 데이터 로드 상태
  const [detailedData, setDetailedData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState(null)

  // 상세보기 열렸을 때 API 호출 (의도한 흐름: 상세보기 버튼 클릭 시)
  useEffect(() => {
    let mounted = true
    
    // matchId가 없으면 실행 안 함
    if (!matchId || detailedData || loadingDetail) return
    
    setLoadingDetail(true)
    setError(null)
    
    ;(async () => {
      try {
        // 백엔드 /match/detail/{matchId} 호출
        const detail = await fetchMatchDetail(matchId, false)
        if (!mounted) return
        
        // detail.match.participants를 normalize에 맞게 주입
        const enriched = normalizeFromRawParticipants({
          ...matchData,
          rawParticipants: null,
          participants: Array.isArray(detail?.match?.info?.participants) ? detail.match.info.participants : [],
          gameDuration: detail?.match?.info?.gameDuration ?? matchData?.gameDurationSec ?? matchData?.gameDuration,
          ddVer: matchData?.ddVer,
          teams: Array.isArray(detail?.teams) ? detail.teams : [],
        })
        
        setDetailedData(enriched)
      } catch (e) {
        if (mounted) {
          setError(String(e))
          console.error('[MatchDetails] Detail fetch failed:', e)
        }
      } finally {
        if (mounted) setLoadingDetail(false)
      }
    })()
    
    return () => { mounted = false }
  }, [matchId]) // matchId가 변경될 때만 호출 (상세보기 열릴 때)

  // 표시할 플레이어 데이터 (상세 데이터가 있으면 사용, 없으면 기본 데이터)
  const players = Array.isArray(detailedData) && detailedData.length > 0
    ? detailedData
    : normalizeFromRawParticipants(matchData)

  const lossTeam = players.filter(p => p.team === 'loss')
  const winTeam = players.filter(p => p.team === 'win')
  const lossSideLabel = (lossTeam[0]?.side === 'blue') ? '블루팀' : (lossTeam[0]?.side === 'red') ? '레드팀' : ''
  const winSideLabel  = (winTeam[0]?.side === 'blue') ? '블루팀' : (winTeam[0]?.side === 'red') ? '레드팀' : ''
  // 그래프 최대값: 해당 게임에서 가장 큰 가한 피해량(최소 1 보장)
  const maxDamage = Math.max(...[...lossTeam, ...winTeam].map(p => p.damageDealt || 0), 1)

  // TODO: 롤 공식 API 연동 시 gold 값을 실제 데이터로 바인딩합니다.
  const getGoldForPlayer = (player) => {
    if (typeof player.gold === 'number') return player.gold
    // 하드코딩: 이름+챔피언 기반으로 안정적인 더미 골드 생성 (대략 5,500~9,000)
    const key = `${player.name}-${player.champion?.name || ''}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    const raw = 5500 + (hash % 3501) // 5500 ~ 9001
    return Math.round(raw / 10) * 10 // 10단위 반올림
  }

  const renderPlayerRow = (player, index) => {
    // 아이템 6칸을 항상 채우기 위해 빈 슬롯으로 패딩
    const itemSlots = Array.from({ length: 6 }, (_, i) => (player?.items && player.items[i]) || '');
    return (
      <div key={index} className={`player-row ${player.team === 'win' ? 'win-team' : 'loss-team'}`}>
        <div className="player-identity">
          <div className="champ-icon-wrapper">
            <img className="champ-icon" src={player.champion.imageUrl} alt={player.champion.name} />
            <span className="champ-level">{player.champion.level}</span>
          </div>
          <div className="spells-runes">
            <div className="spells">
              <img src={player.spells[0]} />
              <img src={player.spells[1]} />
            </div>
            <div className="runes">
              {(Array.isArray(player.runes) ? player.runes : []).filter(Boolean).map((src, idx) => (
                <img key={idx} src={src} />
              ))}
            </div>
          </div>
          <div className="player-name-tier">
            <span className="player-name">{player.name}</span>
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
          <p className="cspm">분당 {player.cspm}</p>
        </div>
        <div className="gold-details">
          {/* 하드코딩: 골드 바인딩 위치 */}
          <p>{getGoldForPlayer(player)}</p>
        </div>
        <div className="items-details">
          {itemSlots.map((item, i) => (
            item ? <img key={i} src={item} /> : <div key={i} className="empty-item"></div>
          ))}
          {player.trinket ? <img className="trinket" src={player.trinket} /> : <div className="empty-item trinket"></div>}
        </div>
      </div>
    )
  }

  return (
    <div className="match-details-container">
      <div className="details-tabs">
        <button className="active">종합</button>
        <button>팀 분석</button>
        <button>빌드</button>
        <button>기타</button>
      </div>
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
          <span className="header-item">피해량 / 받은 피해량</span>
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
