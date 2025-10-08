// 우측 최근 챔피언 섹션
import { useState } from 'react'

function RecentChampionsCard({ data }) {
  const [activeTab, setActiveTab] = useState('solo')

  return (
    <div className="info-card recent-champions-card">
      <div className="recent-champions-header">
        <button className={`tab-btn ${activeTab === 'season' ? 'active' : ''}`} onClick={() => setActiveTab('season')}>S2025</button>
        <button className={`tab-btn ${activeTab === 'solo' ? 'active' : ''}`} onClick={() => setActiveTab('solo')}>개인/2인 랭크</button>
        <button className={`tab-btn ${activeTab === 'flex' ? 'active' : ''}`} onClick={() => setActiveTab('flex')}>자유 랭크</button>
      </div>
      <ul className="champion-stats-list">
        {data.map((champ, index) => (
          <li key={index}>
            <img src={champ.imageUrl} alt={champ.name} className="champ-icon"/>
            <div className="champ-details">
              <p className="champ-name">{champ.name}</p>
              <p className="champ-cs">CS {champ.cs}</p>
            </div>
            <div className="champ-kda-stats">
              <p className="kda-ratio">{champ.kdaRatio}</p>
              <p className="kda-numbers">{champ.kdaNumbers}</p>
            </div>
            <div className="champ-winrate-stats">
              <p className={`winrate ${champ.winrate === '100%' ? 'winrate-perfect' : ''}`}>{champ.winrate}</p>
              <p className="games-played">{champ.games}</p>
            </div>
          </li>
        ))}
      </ul>
      <a href="#" className="view-more-link">더 보기 + 다른 시즌 보기 <i className="fa-solid fa-chevron-right"></i></a>
    </div>
  )
}

export default RecentChampionsCard


