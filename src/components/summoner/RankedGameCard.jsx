// 우측 개인/2인 랭크 게임 섹션
import { buildRankEmblemUrl, buildOpggEmblemFallbackUrl } from '../../data/ddragon.js'
function RankedGameCard({ entry, loading, error }) {
  // 랭크 카드: 백엔드 응답에 맞춰 표시, 값 없으면 디폴트
  const tier = entry?.tier || 'Gold'
  const rank = entry?.rank || '4'
  const lp = entry?.leaguePoints ?? 6
  const wins = entry?.wins ?? 9
  const losses = entry?.losses ?? 3
  const winrate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
  // 엠블렘: CommunityDragon 사용, 실패 시 OPGG 폴백 1회
  const emblemTier = (entry?.tier || 'GOLD').toLowerCase()
  const emblemUrl = buildRankEmblemUrl(emblemTier)
  return (
    <div className="info-card">
      <div className="rank-header">
        <h3>개인/2인 랭크 게임</h3>
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
      <ul className="season-history">
        <li><strong>S2023 S1</strong> <span>Gold 4</span></li>
        <li><strong>S2022</strong> <span>Bronze 1</span></li>
        <li><strong>S2021</strong> <span>Silver 2</span></li>
      </ul>
      <a href="#" className="view-all-seasons">모든 시즌 티어 보기</a>
    </div>
  )
}

export default RankedGameCard


