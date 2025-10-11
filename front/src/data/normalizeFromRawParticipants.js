// src/utils/normalizeFromRawParticipants.js
import {
    buildChampionSquareUrl,
    buildItemIconUrl,
    tryBuildSummonerSpellIconUrl,
    buildRuneStyleIcon,
    tryBuildRuneIconUrl,
    PLACEHOLDER_IMG,
} from './ddragon.js'  // ⚠️ 실제 경로에 맞게 import 수정

export function normalizeFromRawParticipants(matchData) {
    const list = Array.isArray(matchData?.rawParticipants)
        ? matchData.rawParticipants
        : (Array.isArray(matchData?.participants) ? matchData.participants : [])
    const ver = matchData?.ddVer || '15.18.1'
    const durationSec = Number(matchData?.gameDurationSec || matchData?.gameDuration || 0)

    return list.map((p) => {
        const keystone = p?.keystoneId || (p?.perkIds?.[0] ?? null)
        const subStyle = p?.perkSubStyle || (p?.subStyleId ?? null)

        return {
            team: p?.teamId === 100 ? 'loss' : 'win', // 블루팀=loss, 레드팀=win
            name: p?.summonerName || p?.riotIdGameName || '-',
            tier: '',
            champion: {
                name: p?.championName || 'Aatrox',
                level: p?.champLevel ?? 0,
                imageUrl: buildChampionSquareUrl(ver, p?.championName),
            },
            // 스펠 & 룬 아이콘 (Data Dragon 기반)
            spells: [
                tryBuildSummonerSpellIconUrl(ver, p?.summoner1Id, PLACEHOLDER_IMG),
                tryBuildSummonerSpellIconUrl(ver, p?.summoner2Id, PLACEHOLDER_IMG),
            ],
            runes: [
                tryBuildRuneIconUrl(keystone, PLACEHOLDER_IMG), // 🔹 키스톤(Perk)
                buildRuneStyleIcon(subStyle, PLACEHOLDER_IMG),  // 🔹 서브 스타일(트리)
            ],

            // 전투 지표
            kda: `${p?.kills ?? 0}/${p?.deaths ?? 0}/${p?.assists ?? 0}`,
            kp: p?.killParticipation != null ? `${Math.round(p.killParticipation * 100)}%` : '',
            kdaRatio: safeKdaRatio(p?.kills, p?.deaths, p?.assists),
            damageDealt: p?.totalDamageDealtToChampions ?? 0,
            cs: (p?.cs != null ? p.cs : (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0)),
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
    const cs = (p?.totalMinionsKilled ?? 0) + (p?.neutralMinionsKilled ?? 0)
    const m = Math.max(1, Math.floor((Number(gameDurationSec) || 0) / 60))
    return (cs / m).toFixed(1)
}
