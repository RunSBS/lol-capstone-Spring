// 중단 메인 컨텐츠 네비게이션 바바
import { useState, useMemo } from 'react'
import RecentGamesSummary from './RecentGamesSummary.jsx'
import MatchHistoryItem from './MatchHistoryItem.jsx'

function MainContent({ summaryData, matches, view }) {
    const [activeTab, setActiveTab] = useState('all')
    const filtered = (() => {
        if (activeTab === 'all') return matches
        if (activeTab === 'solo')  return matches.filter(m => m.queueType === 'RANKED_SOLO_5x5' || m.queueId === 420)
        if (activeTab === 'flex')  return matches.filter(m => m.queueType === 'RANKED_FLEX_SR' || m.queueId === 440)
        if (activeTab === 'recent') return matches // 너 의도에 맞게 정의(예: 지난 7일만 등)
        return matches
    })()

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
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>전체</button>
            <button className={activeTab === 'solo' ? 'active' : ''} onClick={() => setActiveTab('solo')}>개인/2인 랭크 게임</button>
            <button className={activeTab === 'flex' ? 'active' : ''} onClick={() => setActiveTab('flex')}>자유 랭크 게임</button>
            <button className={activeTab === 'recent' ? 'active' : ''} onClick={() => setActiveTab('recent')}>최근 플레이</button>
          </div>
          {filtered.length > 0 && <RecentGamesSummary data={filteredSummaryData} />}
          <div className="match-history-list">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                <p>최근 기록된 전적이 없습니다.</p>
              </div>
            ) : (
              filtered.map((match) => (
                <MatchHistoryItem key={match.id} matchData={match} />
              ))
            )}
          </div>
        </div>
        )
}

export default MainContent


