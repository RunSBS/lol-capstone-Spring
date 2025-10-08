// 중단 메인 컨텐츠 네비게이션 바바
import { useState } from 'react'
import RecentGamesSummary from './RecentGamesSummary.jsx'
import MatchHistoryItem from './MatchHistoryItem.jsx'

function MainContent({ summaryData, matches }) {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="left-column">
      <div className="content-tabs">
        <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>전체</button>
        <button className={activeTab === 'solo' ? 'active' : ''} onClick={() => setActiveTab('solo')}>개인/2인 랭크 게임</button>
        <button className={activeTab === 'flex' ? 'active' : ''} onClick={() => setActiveTab('flex')}>자유 랭크 게임</button>
        <button className={activeTab === 'recent' ? 'active' : ''} onClick={() => setActiveTab('recent')}>최근 플레이</button>
      </div>
      <RecentGamesSummary data={summaryData} />
      <div className="match-history-list">
        {matches.map((match) => (
          <MatchHistoryItem key={match.id} matchData={match} />
        ))}
      </div>
    </div>
  )
}

export default MainContent


