// 중단 매치 상세 표
function MatchDetails({ matchData }) {
  // 입력 데이터 정규화 (목데이터/실데이터 모두 지원)
  const players = Array.isArray(matchData?.detailedPlayers) && matchData.detailedPlayers.length
    ? matchData.detailedPlayers
    : normalizeFromRawParticipants(matchData)
  const lossTeam = players.filter(p => p.team === 'loss')
  const winTeam = players.filter(p => p.team === 'win')
  // 그래프 최대값: 해당 게임에서 가장 큰 가한 피해량(최소 1 보장)
  const maxDamage = Math.max(...[...lossTeam, ...winTeam].map(p => p.damageDealt || 0), 1)

  // TODO: 롤 공식 API 연동 시 gold 값을 실제 데이터로 바인딩합니다.
  const getGoldForPlayer = (player) => {
    if (typeof player.gold === 'number') return player.gold
    // 하드코딩: 이름+챔피언 기반으로 안정적인 더미 골드 생성 (대략 5,500~9,000)
    const key = `${player.name}-${player.champion?.name || ''}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    const raw = 5500 + (hash % 3501) // 5500 ~ 9001
    return Math.round(raw / 10) * 10 // 10단위 반올림
  }

  const renderPlayerRow = (player, index) => (
    <div key={index} className={`player-row ${player.team === 'win' ? 'win-team' : 'loss-team'}`}>
      <div className="player-identity">
        <div className="champ-icon-wrapper">
          <img className="champ-icon" src={player.champion.imageUrl} alt={player.champion.name} />
          <span className="champ-level">{player.champion.level}</span>
        </div>
        <div className="spells-runes">
          <div className="spells">
            <img src={player.spells[0]} />
            <img src={player.spells[1]} />
          </div>
          <div className="runes">
            <img src={player.runes[0]} />
            <img src={player.runes[1]} />
          </div>
        </div>
        <div className="player-name-tier">
          <span className="player-name">{player.name}</span>
          <span className="player-tier">{player.tier}</span>
        </div>
      </div>
      <div className="kda-details">
        <p className="kda-text">{player.kda} ({player.kp})</p>
        <p className="kda-ratio-text" style={{color: player.kdaRatio === '4.43:1' || player.kdaRatio === '4.29:1' ? 'var(--color-win)' : 'var(--color-text-light)'}}>{player.kdaRatio}</p>
      </div>
      <div className="damage-details">
        <span className="damage-values">{Number(player.damageDealt || 0).toLocaleString()}</span>
        <div className="damage-bar-container">
          <div
            className="damage-bar dealt"
            style={{ width: `${Math.min(100, Math.max(0, ((player.damageDealt || 0) / maxDamage) * 100))}%` }}
          ></div>
        </div>
      </div>
      <div className="cs-details">
        <p>{player.cs}</p>
        <p className="cspm">분당 {player.cspm}</p>
      </div>
      <div className="gold-details">
        {/* 하드코딩: 골드 바인딩 위치 */}
        <p>{getGoldForPlayer(player)}</p>
      </div>
      <div className="items-details">
        {player.items.map((item, i) => (
          item ? <img key={i} src={item} /> : <div key={i} className="empty-item"></div>
        ))}
        <img className="trinket" src={player.trinket} />
      </div>
    </div>
  )

  return (
    <div className="match-details-container">
      <div className="details-tabs">
        <button className="active">종합</button>
        <button>팀 분석</button>
        <button>빌드</button>
        <button>기타</button>
      </div>
      <div className="team-table">
        <div className="table-header">
          <span className="header-item">패배 (블루팀)</span>
          <span className="header-item">KDA</span>
          <span className="header-item">피해량</span>
          <span className="header-item">CS</span>
          <span className="header-item">골드</span>
          <span className="header-item">아이템</span>
        </div>
        {lossTeam.map(renderPlayerRow)}
        <div className="table-header" style={{borderTop: '1px solid var(--color-border)', marginTop: '5px'}}>
          <span className="header-item">승리 (레드팀)</span>
          <span className="header-item">KDA</span>
          <span className="header-item">피해량</span>
          <span className="header-item">CS</span>
          <span className="header-item">골드</span>
          <span className="header-item">아이템</span>
        </div>
        {winTeam.map(renderPlayerRow)}
      </div>
    </div>
  )
}

export default MatchDetails

// rawParticipants(riot) → 상세 표 렌더링용 포맷으로 변환
function normalizeFromRawParticipants(matchData) {
  const list = Array.isArray(matchData?.rawParticipants) ? matchData.rawParticipants : []
  const ver = matchData?.ddVer || '15.18.1'
  const toChampImg = (name) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${name || 'Aatrox'}.png`
  const toItem = (id) => (id || id === 0) ? `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png` : null
  return list.map((p) => ({
    team: p?.teamId === 100 ? 'loss' : 'win', // 화면 스타일 유지(블루=패배, 레드=승리) - 실제 승패는 상단에 표시됨
    name: p?.summonerName || p?.riotIdGameName || '-',
    tier: '',
    champion: { name: p?.championName || 'Aatrox', level: p?.champLevel ?? 0, imageUrl: toChampImg(p?.championName) },
    spells: [null, null],
    runes: [null, null],
    kda: `${p?.kills ?? 0}/${p?.deaths ?? 0}/${p?.assists ?? 0}`,
    kp: '',
    kdaRatio: safeKdaRatio(p?.kills, p?.deaths, p?.assists),
    damageDealt: p?.totalDamageDealtToChampions ?? 0,
    cs: (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0),
    cspm: computeCsPerMinute(p, matchData?.gameDurationSec),
    items: [toItem(p?.item0), toItem(p?.item1), toItem(p?.item2), toItem(p?.item3), toItem(p?.item4), toItem(p?.item5)],
    trinket: toItem(p?.item6) || '',
    gold: p?.goldEarned,
  }))
}

function safeKdaRatio(k = 0, d = 0, a = 0) {
  const denom = d === 0 ? 1 : d
  return `${((k + a) / denom).toFixed(2)}:1`
}

function computeCsPerMinute(p, gameDurationSec) {
  const cs = (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0)
  const m = Math.max(1, Math.floor((Number(gameDurationSec) || 0) / 60))
  return (cs / m).toFixed(1)
}


