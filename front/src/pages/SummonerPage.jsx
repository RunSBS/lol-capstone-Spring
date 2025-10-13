import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/summoner.css'
import { recentChampionsData, masteryData, playedWithData, winData, lossData, recentGamesSummaryData } from '../data/mockData.js'
import Header from '../components/common/Header.jsx'
import Footer from '../components/common/Footer.jsx'
import SummonerProfile from '../components/summoner/SummonerProfile.jsx'
import GameModeNavigation from '../components/summoner/GameModeNavigation.jsx'
import RankedGameCard from '../components/summoner/RankedGameCard.jsx'
import FlexRankCard from '../components/summoner/FlexRankCard.jsx'
import RecentChampionsCard from '../components/summoner/RecentChampionsCard.jsx'
import MasteryCard from '../components/summoner/MasteryCard.jsx'
import PlayedWithCard from '../components/summoner/PlayedWithCard.jsx'
import MainContent from '../components/summoner/MainContent.jsx'
// 백엔드 API 호출 유틸
import { fetchSummonerView, fetchRecentMatches, fetchDDragonVersion } from '../data/api.js'
// Data Dragon 아이콘 URL 유틸
import { buildChampionSquareUrl, buildItemIconUrl, tryBuildSummonerSpellIconUrl, tryBuildRuneIconUrl, buildRuneStyleIcon, loadSpellMap, loadRuneMap, inferStyleIdFromPerkId, getStyleStaticIcon } from '../data/ddragon.js'
function SummonerPage() {
  // URL 파라미터에서 gameName#tagLine 분리
  const { nickname } = useParams()
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ddVer, setDdVer] = useState('15.18.1')
  const [recent, setRecent] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const { gameName, tagLine } = useMemo(() => {
    const decoded = decodeURIComponent(nickname || '')
    const [name, tag] = decoded.split('#')
    return { gameName: name || '', tagLine: (tag || '').toLowerCase() }
  }, [nickname])

  useEffect(() => {
    // 최신 버전/소환사 뷰 로드 후 최근 전적까지 이어서 호출
    let mounted = true
    if (!gameName || !tagLine) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchDDragonVersion().catch(() => '15.18.1'),
      fetchSummonerView(gameName, tagLine)
    ])
      .then(async ([ver, v]) => {
        if (!mounted) return
        setDdVer(ver || '15.18.1')
        setView(v)
        // 스펠/룬 매핑 사전 로딩 (아이콘 URL 매핑)
        try { await Promise.all([loadSpellMap(ver), loadRuneMap(ver)]) } catch {}
        // 최근 전적도 병렬로 호출
        try {
          const matches = await fetchRecentMatches(gameName, tagLine, 10)
          if (!mounted) return
          setRecent(Array.isArray(matches) ? matches : [])
        } catch (e) {
          if (mounted) setRecent([])
        }
      })
      .catch((e) => { if (mounted) setError(String(e)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [gameName, tagLine])
  const handleRefresh = async () => {
    // 전적 갱신 버튼 대응: 다시 view/최근전적 로드
    if (!gameName || !tagLine) return
    setRefreshing(true)
    try {
      const v = await fetchSummonerView(gameName, tagLine)
      setView(v)
      try {
        const m = await fetchRecentMatches(gameName, tagLine, 10)
        setRecent(Array.isArray(m) ? m : [])
      } catch {}
    } finally {
      setRefreshing(false)
    }
  }

  // Recent 매치를 기존 UI shape으로 변환 (아이템/스펠/룬 아이콘 포함)
  const transformedMatches = useMemo(() => {
    const ver = ddVer || '15.18.1'
    const toChampionImg = (champ) => buildChampionSquareUrl(ver, champ)
    const fmtDuration = (seconds = 0) => {
      const s = Math.max(0, Math.floor(Number(seconds) || 0))
      const m = Math.floor(s / 60)
      const sec = s % 60
      const p2 = (n) => n.toString().padStart(2, '0')
      return `${m}:${p2(sec)}`
    }
    const timeAgo = (ms) => {
      const diff = Date.now() - Number(ms || 0)
      if (!isFinite(diff) || diff < 0) return '-'
      const sec = Math.floor(diff / 1000)
      if (sec < 60) return `${sec}초 전`
      const min = Math.floor(sec / 60)
      if (min < 60) return `${min}분 전`
      const hr = Math.floor(min / 60)
      if (hr < 24) return `${hr}시간 전`
      const day = Math.floor(hr / 24)
      return `${day}일 전`
    }
    const queueTypeMap = {
      420: 'RANKED_SOLO_5x5',
      440: 'RANKED_FLEX_SR',
      400: 'NORMAL_BLIND',
      430: 'NORMAL_DRAFT',
      450: 'ARAM',
    }

    try {
      return (recent || []).map((m) => {
        const list = Array.isArray(m?.participants) ? m.participants : []
        const me = view ? list.find((p) => p?.puuid === view.puuid) : list[0]
        const isWin = !!me?.win
        const k = me?.kills ?? 0
        const d = me?.deaths ?? 0
        const a = me?.assists ?? 0
        const cs = (me?.csTotal != null ? me.csTotal : (me?.cs != null ? me.cs : ((me?.totalMinionsKilled ?? 0) + (me?.neutralMinionsKilled ?? 0))))
        const champ = me?.championName || 'Aatrox'
        const team1 = list.filter((p) => p?.teamId === 100).map((p) => ({ team: 1, champion: toChampionImg(p.championName || 'Aatrox'), name: p.summonerName || p.riotIdGameName || '-' }))
        const team2 = list.filter((p) => p?.teamId === 200).map((p) => ({ team: 2, champion: toChampionImg(p.championName || 'Aatrox'), name: p.summonerName || p.riotIdGameName || '-' }))
        // 아이템 URL 생성: item0~item5 + trinket(item6)
        const itemIds = [me?.item0, me?.item1, me?.item2, me?.item3, me?.item4, me?.item5]
        const items = itemIds.map((id) => (id || id === 0) ? buildItemIconUrl(ver, id) : null)
        const trinket = (me?.item6 || me?.item6 === 0) ? buildItemIconUrl(ver, me.item6) : ''

        // 스펠 아이콘
        const spells = [
            tryBuildSummonerSpellIconUrl(ver, me?.summoner1Id),
            tryBuildSummonerSpellIconUrl(ver, me?.summoner2Id),
          ]
        // 룬 아이콘 (styles 배열 순서 보장 X → description으로 구분)
        // 룬 정보: 표준 perks.styles 우선, 없으면 백엔드가 주는 대체 필드(primaryStyleId/subStyleId/keystoneId/perkIds[0]) 사용
        const styles = Array.isArray(me?.perks?.styles) ? me.perks.styles : []
        const primary = styles.find(s => s?.description === 'primaryStyle')
        const sub     = styles.find(s => s?.description === 'subStyle')

        const primaryStyleIdRaw = (primary?.style ?? me?.primaryStyleId ?? me?.primaryStyle ?? null)
        const subStyleIdRaw     = (sub?.style     ?? me?.subStyleId     ?? me?.perkSubStyle ?? null)
        const keystoneId        = (primary?.selections?.[0]?.perk ?? me?.keystoneId ?? (Array.isArray(me?.perkIds) ? me.perkIds[0] : null))

        // 부족한 값 보정: keystone/perkIds 기반으로 스타일 유추
        let primaryStyleId = primaryStyleIdRaw
        if (!primaryStyleId && keystoneId) {
          const inf = inferStyleIdFromPerkId(keystoneId)
          if (inf) primaryStyleId = inf
        }
        let subStyleId = subStyleIdRaw
        if (!subStyleId) {
          const pids = Array.isArray(me?.perkIds) ? me.perkIds : []
          for (const pid of pids) {
            const st = inferStyleIdFromPerkId(pid)
            if (st && st !== primaryStyleId) { subStyleId = st; break; }
          }
        }

        // 아이콘 URL 생성 (빈 값은 제거)
        const runes = []
        if (keystoneId) runes.push(tryBuildRuneIconUrl(keystoneId))
        if (subStyleId || primaryStyleId) runes.push(getStyleStaticIcon(subStyleId || primaryStyleId))
        return {
          id: m.matchId,
          queueId: m.queueId,
          queueType: queueTypeMap[m.queueId] || 'OTHER',
          gameType: m.gameMode || 'CLASSIC',
          timeAgo: timeAgo(m.gameCreation),
          result: isWin ? '승리' : '패배',
          duration: fmtDuration(m.gameDuration),
          champion: {
            name: champ,
            level: me?.champLevel ?? 0,
            imageUrl: toChampionImg(champ),
            spells,
            runes,
          },
          kda: { kills: k, deaths: d, assists: a },
          items,
          trinket,
          teams: [...team1, ...team2],
          stats: {
            killParticipation: me?.challenges?.killParticipation ? Math.round((me.challenges.killParticipation) * 100) : 0,
            cs,
            csPerMinute: ((cs / Math.max(1, m.gameDuration / 60)).toFixed(1)),
            rank: '-',
          },
          // MatchDetails용 원본 데이터 참조
          rawParticipants: list,
          ddVer: ver,
          gameDurationSec: m.gameDuration,
        }
      })
    } catch {
      return []
    }
  }, [recent, ddVer, view])

  // SummonerPage 내부에 추가 (transformedMatches 아래쯤)
  const summaryData = useMemo(() => {
    const games = transformedMatches || []
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

    // 선호 포지션 (teamPosition 사용 권장)
    const roleCount = { TOP:0, JNG:0, MID:0, ADC:0, SUP:0, UNKNOWN:0 }
    for (const g of games) {
      const me = g.rawParticipants?.find(p => p?.puuid === (view?.puuid || ''))
      const role = (me?.teamPosition || 'UNKNOWN').toUpperCase()
      roleCount[role] = (roleCount[role] || 0) + 1
    }
    const positions = ['TOP','JNG','MID','ADC','SUP'].map(role => {
      const pct = Math.round((roleCount[role] * 100) / total)
      const iconMap = {
        TOP: 'https://s-lol-web.op.gg/images/icon/icon-position-top.svg',
        JNG: 'https://s-lol-web.op.gg/images/icon/icon-position-jungle.svg',
        MID: 'https://s-lol-web.op.gg/images/icon/icon-position-mid.svg',
        ADC: 'https://s-lol-web.op.gg/images/icon/icon-position-adc.svg',
        SUP: 'https://s-lol-web.op.gg/images/icon/icon-position-support.svg',
      }
      return { role, percentage: pct, icon: iconMap[role] }
    })

    return { total, wins, losses, winrate, avg, playedChamps, positions }
  }, [transformedMatches, view])

  return (
    <>
      <Header />
      <div id="opgg-container">
        <SummonerProfile
          nickname={nickname}
          profileIconId={view?.profileIconId}
          summonerLevel={view?.summonerLevel}
          gameName={view?.gameName}
          tagLine={view?.tagLine}
          puuid={view?.puuid}
          revisionDate={view?.revisionDate}
          ddVer={ddVer}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />
        <GameModeNavigation />
        <div className="main-layout">
          <MainContent
            summaryData={summaryData}
            matches={transformedMatches}
          />
          <div className="right-column">
            <RankedGameCard entry={view?.soloRanked} loading={loading} error={error} />
            <FlexRankCard entry={view?.flexRanked} loading={loading} error={error} />
            <RecentChampionsCard data={recentChampionsData} />
            <MasteryCard data={masteryData} />
            <PlayedWithCard data={playedWithData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SummonerPage


