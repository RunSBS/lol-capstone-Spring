// 우측 자유 랭크 게임 섹션
import { buildRankEmblemUrl, buildOpggEmblemFallbackUrl } from '../../data/ddragon.js'
function FlexRankCard({ entry, loading, error }) {
  // 랭크 카드: 백엔드 응답에 맞춰 표시, 값 없으면 디폴트
  const tier = entry?.tier || 'Silver'
  const rank = entry?.rank || '1'
  const lp = entry?.leaguePoints ?? 27
  const wins = entry?.wins ?? 12
  const losses = entry?.losses ?? 3
  const winrate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
  // 엠블렘: CommunityDragon 사용, 실패 시 OPGG 폴백 1회
  const emblemTier = (entry?.tier || 'SILVER').toLowerCase()
  const emblemUrl = buildRankEmblemUrl(emblemTier)
  return (
    <div className="info-card">
      <div className="rank-header">
        <h3>자유 랭크 게임</h3>
        <i className="fa-solid fa-circle-info"></i>
      </div>
      <div className="rank-body">
        <img src={emblemUrl} className="rank-emblem" alt={`${tier} ${rank}`} onError={(e) => {
          const fb = buildOpggEmblemFallbackUrl(entry?.tier, entry?.rank)
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

export default FlexRankCard


