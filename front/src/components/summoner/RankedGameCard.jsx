// 우측 개인/2인 랭크 게임 섹션
import { buildRankEmblemUrl, buildOpggEmblemFallbackUrl } from '../../data/ddragon.js'

function RankedGameCard({ entry, loading, error }) {
  // 티어 정보가 없는지 확인
  const hasTier = entry && entry.tier && entry.tier.trim() !== ''
  
  // 티어 정보가 없으면 "티어 정보가 없습니다" 메시지 표시
  if (loading) {
    return (
      <div className="info-card">
        <div className="rank-header">
          <h3>개인/2인 랭크 게임</h3>
          <i className="fa-solid fa-circle-info" title="랭크 초기화시 최종 티어가 기록"></i>
        </div>
        <div className="rank-body">
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '20px' }}>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !hasTier) {
    return (
      <div className="info-card">
        <div className="rank-header">
          <h3>개인/2인 랭크 게임</h3>
          <i className="fa-solid fa-circle-info" title="랭크 초기화시 최종 티어가 기록"></i>
        </div>
        <div className="rank-body">
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '20px' }}>티어 정보가 없습니다</p>
        </div>
      </div>
    )
  }

  // 랭크 카드: 백엔드 응답에 맞춰 표시
  const tier = entry.tier
  const rank = entry.rank || ''
  const lp = entry.leaguePoints ?? 0
  const wins = entry.wins ?? 0
  const losses = entry.losses ?? 0
  const winrate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
  // 엠블렘: CommunityDragon 사용, 실패 시 OPGG 폴백 1회
  const emblemTier = tier.toLowerCase()
  const emblemUrl = buildRankEmblemUrl(emblemTier)
  
  return (
    <div className="info-card">
      <div className="rank-header">
        <h3>개인/2인 랭크 게임</h3>
        <i className="fa-solid fa-circle-info" title="랭크 초기화시 최종 티어가 기록"></i>
      </div>
      <div className="rank-body">
        <img src={emblemUrl} className="rank-emblem" alt={`${tier} ${rank}`} onError={(e) => {
          // 에메랄드 티어는 로컬 이미지만 사용 (OPGG 폴백 없음)
          if (emblemTier === 'emerald') {
            // 이미 로컬 이미지인데 실패한 경우, 빈 이미지로 처리하거나 기본값 유지
            console.warn('Emerald emblem image failed to load:', emblemUrl)
            return
          }
          // 다른 티어는 OPGG 폴백 사용
          const fb = buildOpggEmblemFallbackUrl(entry.tier, entry.rank)
          if (e.currentTarget.src !== fb) e.currentTarget.src = fb
        }} />
        <div className="rank-info-small">
          <p className="rank-tier">{tier} {rank}</p>
          <p className="rank-lp">{lp} LP</p>
        </div>
        <div className="rank-win-loss">
          <span>{wins}승 {losses}패</span>
          <span>승률 {winrate}%</span>
        </div>
      </div>
    </div>
  )
}

export default RankedGameCard


