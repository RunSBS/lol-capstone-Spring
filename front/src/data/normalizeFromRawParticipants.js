// src/utils/normalizeFromRawParticipants.js
import {
    buildChampionSquareUrl,
    buildItemIconUrl,
    tryBuildSummonerSpellIconUrl,
    buildRuneStyleIcon,
    tryBuildRuneIconUrl,
    PLACEHOLDER_IMG,
    inferStyleIdFromPerkId,
    getStyleStaticIcon, 
} from './ddragon.js'  // ⚠️ 실제 경로에 맞게 import 수정

export function normalizeFromRawParticipants(matchData) {
    const list = Array.isArray(matchData?.rawParticipants)
        ? matchData.rawParticipants
        : (Array.isArray(matchData?.participants) ? matchData.participants : [])
    const ver = matchData?.ddVer || '15.18.1'
    const durationSec = Number(matchData?.gameDurationSec || matchData?.gameDuration || 0)
    // 팀 승패 맵: detail 응답에 participants.win이 없을 때 teams 배열에서 유도
    const teamWinById = new Map(
        (Array.isArray(matchData?.teams) ? matchData.teams : []).map(t => [t?.teamId, !!t?.win])
    )

    return list.map((p) => {
        const keystone = (p?.keystoneId ?? (Array.isArray(p?.perkIds) ? p.perkIds[0] : null))
        let primaryStyle = (p?.primaryStyleId ?? p?.primaryStyle ?? null)
        let subStyle = (p?.perkSubStyle ?? p?.subStyleId ?? null)

        // 기본 스타일이 없으면 키스톤으로부터 유추
        if (!primaryStyle && keystone != null) {
            const inferred = inferStyleIdFromPerkId(keystone)
            if (inferred) primaryStyle = inferred
        }
        // 보조 스타일이 없으면 perkIds에서 유추(기본 스타일과 다른 계열을 선택)
        if (!subStyle) {
            const perkIds = Array.isArray(p?.perkIds) ? p.perkIds : []
            for (const pid of perkIds) {
                const st = inferStyleIdFromPerkId(pid)
                if (st && st !== primaryStyle) { subStyle = st; break; }
            }
        }

        return {
            team: ((p?.win != null) ? !!p.win : (teamWinById.get(p?.teamId) ?? false)) ? 'win' : 'loss',
            side: p?.teamId === 100 ? 'blue' : 'red',
            name: p?.summonerName || p?.riotIdGameName || '-',
            tier: '',
            champion: {
                name: p?.championName || 'Aatrox',
                level: p?.champLevel ?? 0,
                imageUrl: buildChampionSquareUrl(ver, p?.championName),
            },
            // 스펠 & 룬 아이콘 (Data Dragon 기반)
            spells: [
                tryBuildSummonerSpellIconUrl(ver, (p?.summoner1Id ?? p?.spell1Id), PLACEHOLDER_IMG),
                tryBuildSummonerSpellIconUrl(ver, (p?.summoner2Id ?? p?.spell2Id), PLACEHOLDER_IMG),
            ],
            runes: [
                tryBuildRuneIconUrl(keystone, PLACEHOLDER_IMG), // 🔹 키스톤(Perk)
                getStyleStaticIcon(subStyle || primaryStyle, PLACEHOLDER_IMG),  // 🔹 서브 스타일 없으면 기본 스타일 아이콘 사용 (정적 720x)
            ],

            // 전투 지표
            kda: `${p?.kills ?? 0}/${p?.deaths ?? 0}/${p?.assists ?? 0}`,
            kp: p?.killParticipation != null ? `${Math.round(p.killParticipation * 100)}%` : '',
            kdaRatio: safeKdaRatio(p?.kills, p?.deaths, p?.assists),
            damageDealt: Number(p?.totalDamageDealtToChampions ?? p?.damageDealtToChampions ?? p?.championDamage ?? p?.totalDamageDealt ?? p?.damageDealt ?? 0) || 0,
            cs: (p?.cs != null ? p.cs : (p?.csTotal != null ? p.csTotal : (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0))),
            cspm: computeCsPerMinute(p, durationSec),
            gold: p?.goldEarned,

            // 아이템 0~5 + 장신구(6)
            items: [
                buildItemIconUrl(ver, p?.item0),
                buildItemIconUrl(ver, p?.item1),
                buildItemIconUrl(ver, p?.item2),
                buildItemIconUrl(ver, p?.item3),
                buildItemIconUrl(ver, p?.item4),
                buildItemIconUrl(ver, p?.item5),
            ],
            trinket: buildItemIconUrl(ver, p?.item6),
        }
    })
}

function safeKdaRatio(k = 0, d = 0, a = 0) {
    const denom = d === 0 ? 1 : d
    return `${((k + a) / denom).toFixed(2)}:1`
}

function computeCsPerMinute(p, gameDurationSec) {
    const cs = (p?.cs != null ? p.cs : (p?.csTotal != null ? p.csTotal : (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0)))
    const m = Math.max(1, Math.floor((Number(gameDurationSec) || 0) / 60))
    return (cs / m).toFixed(1)
}
