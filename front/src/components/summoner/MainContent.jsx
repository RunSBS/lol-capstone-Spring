// 중단 메인 컨텐츠 네비게이션 바바
import { useState } from 'react'
import RecentGamesSummary from './RecentGamesSummary.jsx'
import MatchHistoryItem from './MatchHistoryItem.jsx'

function MainContent({ summaryData, matches }) {
    const [activeTab, setActiveTab] = useState('all')
    const filtered = (() => {
        if (activeTab === 'all') return matches
        if (activeTab === 'solo')  return matches.filter(m => m.queueType === 'RANKED_SOLO_5x5' || m.queueId === 420)
        if (activeTab === 'flex')  return matches.filter(m => m.queueType === 'RANKED_FLEX_SR' || m.queueId === 440)
        if (activeTab === 'recent') return matches // 너 의도에 맞게 정의(예: 지난 7일만 등)
        return matches
    })()
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
            {filtered.map((match) => (
              <MatchHistoryItem key={match.id} matchData={match} />
            ))}
          </div>
        </div>
        )
}

export default MainContent


