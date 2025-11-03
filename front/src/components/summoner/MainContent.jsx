// 중단 메인 컨텐츠 네비게이션 바바
import { useState, useMemo, useEffect } from 'react'
import RecentGamesSummary from './RecentGamesSummary.jsx'
import MatchHistoryItem from './MatchHistoryItem.jsx'

function MainContent({ summaryData, matches, view, gameName, tagLine, onLoadMore, loadingMore, onTabChange, loading }) {
    const [activeTab, setActiveTab] = useState('all')
    const [displayedCount, setDisplayedCount] = useState(10)
    
    // 백엔드에서 필터링된 데이터를 받으므로, 탭에 맞는 데이터만 표시
    // 'all' 탭이 아닌 경우에는 이미 백엔드에서 필터링된 데이터가 오므로 그대로 사용
    // 'all' 탭인 경우에도 백엔드에서 모든 게임을 가져왔으므로 그대로 사용
    const filtered = matches
    
    // 탭 변경 시 displayedCount 리셋 및 부모 컴포넌트에 알림
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setDisplayedCount(10)
        // 부모 컴포넌트에 탭 변경 알림 (queueId 전달)
        if (onTabChange) {
            const queueIdMap = {
                'all': null,
                'solo': 420,
                'flex': 440,
                'recent': null
            }
            onTabChange(tab, queueIdMap[tab])
        }
    }
    
    // 더보기 버튼 핸들러
    const handleLoadMore = async () => {
        // 현재 표시된 개수가 필터된 매치 개수보다 작으면 프론트엔드에서 더 표시
        if (displayedCount < filtered.length) {
            setDisplayedCount(prev => Math.min(prev + 10, filtered.length))
        } else if (onLoadMore && gameName && tagLine) {
            // 백엔드에서 추가 데이터 가져오기
            await onLoadMore()
        }
    }
    
    // matches가 업데이트되면 displayedCount 조정 (새로운 데이터가 추가되었을 때)
    useEffect(() => {
        if (filtered.length > displayedCount && displayedCount >= 10) {
            // 새로운 데이터가 추가되었고, 이미 일부가 표시된 상태라면
            // displayedCount를 증가시켜 새로운 항목들을 표시
            const newCount = Math.min(displayedCount + 10, filtered.length)
            if (newCount > displayedCount) {
                setDisplayedCount(newCount)
            }
        }
    }, [filtered.length, displayedCount])
    
    // 표시할 매치 목록 (displayedCount만큼만)
    const displayedMatches = filtered.slice(0, displayedCount)
    // 더 표시할 항목이 있는지 확인 (프론트엔드에 있거나 백엔드에서 더 가져올 수 있으면 true)
    const hasMore = displayedCount < filtered.length || (onLoadMore && gameName && tagLine)

    // 필터링된 매치를 기반으로 통계 계산
    const filteredSummaryData = useMemo(() => {
        const games = filtered || []
        if (!games.length) {
            return {
                total: 0, wins: 0, losses: 0, winrate: 0,
                avg: { kills: 0, deaths: 0, assists: 0, ratio: 0, kp: 0 },
                playedChamps: [],
                positions: []
            }
        }

        const total = games.length
        const wins = games.filter(g => g.result === '승리').length
        const losses = total - wins
        const winrate = Math.round((wins / total) * 100)

        const sum = games.reduce((a, g) => {
            a.k += g.kda.kills
            a.d += g.kda.deaths
            a.a += g.kda.assists
            a.kp += Number(g.stats.killParticipation || 0)
            return a
        }, { k:0, d:0, a:0, kp:0 })

        const avg = {
            kills: (sum.k / total).toFixed(1),
            deaths: (sum.d / total).toFixed(1),
            assists: (sum.a / total).toFixed(1),
            ratio: ((sum.k + sum.a) / Math.max(1, sum.d)).toFixed(2),
            kp: Math.round(sum.kp / total)
        }

        // 챔피언별 집계 (상위 5개)
        const byChamp = new Map()
        for (const g of games) {
            const key = g.champion.name
            const rec = byChamp.get(key) || { name: key, games: 0, wins: 0, k:0, d:0, a:0, imageUrl: g.champion.imageUrl }
            rec.games += 1
            if (g.result === '승리') rec.wins += 1
            rec.k += g.kda.kills
            rec.d += g.kda.deaths
            rec.a += g.kda.assists
            byChamp.set(key, rec)
        }
        const playedChamps = Array.from(byChamp.values())
            .sort((a,b) => b.games - a.games)
            .slice(0, 5)
            .map(c => ({
                name: c.name,
                imageUrl: c.imageUrl,
                winrate: Math.round((c.wins / c.games) * 100) + '%',
                games: `${c.games}게임`,
                kda: (((c.k + c.a) / Math.max(1, c.d)).toFixed(2)) + ':1 평점'
            }))

        // 선호 포지션
        const roleCount = { TOP:0, JUNGLE:0, MIDDLE:0, BOTTOM:0, UTILITY:0, UNKNOWN:0 }
        for (const g of games) {
            const me = g.rawParticipants?.find(p => p?.puuid === (view?.puuid || ''))
            const role = (me?.teamPosition || me?.individualPosition || 'UNKNOWN').toUpperCase()
            roleCount[role] = (roleCount[role] || 0) + 1
        }
        
        const positionMapping = {
            'TOP': 'TOP',
            'JUNGLE': 'JNG', 
            'MIDDLE': 'MID',
            'BOTTOM': 'ADC',
            'UTILITY': 'SUP'
        }
        
        const positions = ['TOP','JNG','MID','ADC','SUP'].map(displayRole => {
            const riotRole = Object.keys(positionMapping).find(key => positionMapping[key] === displayRole)
            const count = roleCount[riotRole] || 0
            const pct = Math.round((count * 100) / total)
            const iconMap = {
                TOP: 'https://s-lol-web.op.gg/images/icon/icon-position-top.svg',
                JNG: 'https://s-lol-web.op.gg/images/icon/icon-position-jungle.svg',
                MID: 'https://s-lol-web.op.gg/images/icon/icon-position-mid.svg',
                ADC: 'https://s-lol-web.op.gg/images/icon/icon-position-adc.svg',
                SUP: 'https://s-lol-web.op.gg/images/icon/icon-position-support.svg',
            }
            return { role: displayRole, percentage: pct, icon: iconMap[displayRole] }
        })

        return { total, wins, losses, winrate, avg, playedChamps, positions }
    }, [filtered, view])

    return (
        <div className="left-column">
          <div className="content-tabs">
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => handleTabChange('all')}>전체</button>
            <button className={activeTab === 'solo' ? 'active' : ''} onClick={() => handleTabChange('solo')}>개인/2인 랭크 게임</button>
            <button className={activeTab === 'flex' ? 'active' : ''} onClick={() => handleTabChange('flex')}>자유 랭크 게임</button>
            <button className={activeTab === 'recent' ? 'active' : ''} onClick={() => handleTabChange('recent')}>최근 플레이</button>
          </div>
          {filtered.length > 0 && <RecentGamesSummary data={filteredSummaryData} />}
          <div className="match-history-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                <p>전적을 불러오는 중...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                <p>최근 기록된 전적이 없습니다.</p>
              </div>
            ) : (
              <>
                {displayedMatches.map((match) => (
                  <MatchHistoryItem key={match.id} matchData={match} view={view} />
                ))}
                {filtered.length > 0 && (
                  <button 
                    className={`load-more-button ${!hasMore ? 'disabled' : ''}`}
                    onClick={handleLoadMore}
                    disabled={!hasMore || loadingMore}
                  >
                    {loadingMore ? '로딩 중...' : (hasMore ? '더 보기' : '모든 전적을 표시했습니다')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        )
}

export default MainContent


