// 메인 소환사 프로필 섹션
import { useEffect, useState } from 'react'

function SummonerProfile({ nickname, profileIconId, summonerLevel, gameName, tagLine, puuid, revisionDate, lastUpdated, ddVer, onRefresh, isRefreshing }) {
  const [ddVersion, setDdVersion] = useState('')
  const [remainingSec, setRemainingSec] = useState(0)
  useEffect(() => {
    // Data Dragon 최신 버전 조회 (외부에서 ddVer 내려오면 생략)
    if (ddVer) return
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then((res) => res.ok ? res.json() : [])
      .then((versions) => { if (Array.isArray(versions) && versions.length > 0) setDdVersion(versions[0]) })
      .catch(() => {})
  }, [ddVer])
  // 전적 갱신 쿨다운 타이머 (실시간 버튼 활성화만 담당)
  useEffect(() => {
    const COOLDOWN_MS = 2 * 60 * 1000
    const last = Number(lastUpdated || revisionDate || 0)
    if (!Number.isFinite(last) || last <= 0) { setRemainingSec(0); return }
    const calc = () => Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000))
    setRemainingSec(calc())
    if (calc() <= 0) return
    const id = setInterval(() => {
      const left = calc()
      setRemainingSec(left)
      if (left <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [lastUpdated, revisionDate])
  // 이름/태그 우선순위: props → URL 파싱
  const decoded = decodeURIComponent(nickname || '')
  const [urlName, urlTag] = decoded.split('#')
  const displayName = gameName || urlName || '소환사명'
  const displayTag = (tagLine || urlTag || 'KR1').toUpperCase()
  // 아이콘/레벨 기본값 처리
  const resolvedProfileIconId = typeof profileIconId === 'number' ? profileIconId : 5426
  const fallbackVersion = '14.5.1'
  const versionForIcon = ddVer || ddVersion || fallbackVersion
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${versionForIcon}/img/profileicon/${resolvedProfileIconId}.png`
  const formatRelativeTime = (ms) => {
    try {
      const t = Number(ms || 0)
      if (!Number.isFinite(t) || t <= 0) return ''
      const diffSec = Math.floor((Date.now() - t) / 1000)
      if (diffSec < 0) return ''
      if (diffSec < 3600) {
        const minutes = Math.max(1, Math.floor(diffSec / 60))
        return `${minutes}분 전`
      }
      if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600)
        return `${hours}시간 전`
      }
      const days = Math.floor(diffSec / 86400)
      return `${days}일 전`
    } catch {
      return ''
    }
  }
  // 쿨다운 표시 텍스트 및 버튼 상태
  const remainingMinText = remainingSec > 0 ? `${Math.ceil(remainingSec / 60)}분 후` : ''
  const refreshDisabled = !!isRefreshing || remainingSec > 0
  return (
    <section className="profile-section">
      <div className="profile-icon-wrapper">
        {/* Data Dragon 최신 버전 + profileIconId 아이콘 */}
        <img className="profile-icon" src={iconUrl} alt="Profile Icon" />
        <span className="profile-level">{summonerLevel ?? '199'}</span>
      </div>
      <div className="profile-info">
        <div className="summoner-name-line">
          <h2 className="summoner-name">{displayName}</h2>
          <span className="summoner-tag">#{displayTag}</span>
        </div>
        {/* 부가 정보: 백엔드 연동 시 자연 표출 */}
        {/*{puuid && <p className="rank-summary"><strong>PUUID</strong> {puuid}</p>}*/}
        {(lastUpdated || revisionDate) && (
          <p className="rank-summary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span>마지막 수정 <strong>{formatRelativeTime(lastUpdated || revisionDate)}</strong></span>
            {refreshDisabled && remainingSec > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>갱신 가능 시간: {remainingMinText}</span>
            )}
          </p>
        )}
        <div className="profile-actions">
          <button className="btn-primary" onClick={onRefresh} disabled={refreshDisabled}>{isRefreshing ? '갱신 중…' : '전적 갱신'}</button>
        </div>
      </div>
    </section>
  )
}

export default SummonerProfile


