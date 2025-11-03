// 우측 최근 챔피언 섹션
import { useState } from 'react'

function RecentChampionsCard({ data }) {
  const [activeTab, setActiveTab] = useState('season')

  // 현재 활성 탭에 따른 데이터 선택
  const currentData = data?.[activeTab] || []

  return (
    <div className="info-card recent-champions-card">
      <div className="recent-champions-header">
        <button className={`tab-btn ${activeTab === 'season' ? 'active' : ''}`} onClick={() => setActiveTab('season')}>전체</button>
        <button className={`tab-btn ${activeTab === 'solo' ? 'active' : ''}`} onClick={() => setActiveTab('solo')}>개인 랭크</button>
        <button className={`tab-btn ${activeTab === 'flex' ? 'active' : ''}`} onClick={() => setActiveTab('flex')}>자유 랭크</button>
      </div>
      <ul className="champion-stats-list">
        {currentData.length > 0 ? (
          currentData.map((champ, index) => {
            // 챔피언 이름이 4글자를 넘으면 자르고 "..." 추가
            const displayName = champ.name && champ.name.length > 4 
              ? champ.name.substring(0, 4) + '...' 
              : champ.name
            return (
            <li key={index}>
              <img src={champ.imageUrl} alt={champ.name} className="champ-icon"/>
              <div className="champ-details">
                <p className="champ-name" title={champ.name}>{displayName}</p>
                <p className="champ-cs">CS {champ.cs || 0}</p>
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
            )
          })
        ) : (
          <li className="no-data">
            <p>해당 모드에서 플레이한 챔피언이 없습니다.</p>
          </li>
        )}
      </ul>
    </div>
  )
}

export default RecentChampionsCard


