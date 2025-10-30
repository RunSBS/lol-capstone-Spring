// 메인 소환사 프로필 섹션
import { useEffect, useState } from 'react'

function SummonerProfile({ nickname, profileIconId, summonerLevel, gameName, tagLine, puuid, revisionDate, ddVer, onRefresh, isRefreshing }) {
  const [ddVersion, setDdVersion] = useState('')
  useEffect(() => {
    // Data Dragon 최신 버전 조회 (외부에서 ddVer 내려오면 생략)
    if (ddVer) return
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then((res) => res.ok ? res.json() : [])
      .then((versions) => { if (Array.isArray(versions) && versions.length > 0) setDdVersion(versions[0]) })
      .catch(() => {})
  }, [ddVer])
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
  const fmtDate = (ms) => { try { return ms ? new Date(Number(ms)).toLocaleString() : '' } catch { return '' } }
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
        {revisionDate && <p className="rank-summary">마지막 수정 <strong>{fmtDate(revisionDate)}</strong></p>}
        <div className="profile-actions">
          <button className="btn-primary" onClick={onRefresh} disabled={!!isRefreshing}>{isRefreshing ? '갱신 중…' : '전적 갱신'}</button>
          <button className="btn-secondary">티어 그래프</button>
        </div>
      </div>
    </section>
  )
}

export default SummonerProfile


