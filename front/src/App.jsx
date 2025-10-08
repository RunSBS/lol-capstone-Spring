// src/App.jsx
import React, { useMemo, useState } from "react";
import "./App.css";
// 티어 슬러그 매핑
const TIER_SLUG = { IRON:'iron', BRONZE:'bronze', SILVER:'silver', GOLD:'gold',
    PLATINUM:'platinum', EMERALD:'emerald', DIAMOND:'diamond',
    MASTER:'master', GRANDMASTER:'grandmaster', CHALLENGER:'challenger' };

function tierEmblemUrls(tier) {
    if (!tier) return [];
    const slug = TIER_SLUG[String(tier).toUpperCase()];
    if (!slug) return [];
    return [
        // CDragon 경로 후보들 (버전에 따라 위치가 조금씩 달라서 여럿 시도)
        `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${slug}.png`,
        `https://raw.communitydragon.org/latest/game/assets/ux/ranked/tiers/league-tier-${slug}.png`,
        // 필요시 다른 브랜치도 한 번 더 시도해봄 (pbe)
        `https://raw.communitydragon.org/pbe/game/assets/ux/ranked-emblems/league-emblem-${slug}.png`,
    ];
}
function buildOpggEmblemFallbackUrl(tier, rank) {
    // tier, rank 값 안전하게 처리
    const t = String(tier || "GOLD").toLowerCase();
    const roman = String(rank || "").toUpperCase();

    // 로마 숫자 → 숫자 매핑
    const map = { I: 1, II: 2, III: 3, IV: 4 };
    const n = map[roman] || 1;

    // OP.GG용 엠블럼 이미지 URL
    return `https://opgg-static.akamaized.net/images/medals/${t}_${n}.png?image=q_auto,f_webp,w_144`;
}

function EmblemImg({ tier, rank, size = 36 }) {
    const urls = React.useMemo(() => {
        if (!tier) return [];

        const slug = TIER_SLUG[String(tier).toUpperCase()];
        if (!slug) return [];

        // 🔁 순서대로 시도: CDragon → PBE → OP.GG
        return [
            `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${slug}.png`,
            `https://raw.communitydragon.org/latest/game/assets/ux/ranked/tiers/league-tier-${slug}.png`,
            `https://raw.communitydragon.org/pbe/game/assets/ux/ranked-emblems/league-emblem-${slug}.png`,
            buildOpggEmblemFallbackUrl(slug, rank), // ✅ 마지막 폴백 (이게 제일 중요)
        ];
    }, [tier, rank]);

    const [idx, setIdx] = React.useState(0);
    if (!urls.length) return null;

    return (
        <Img
            src={urls[idx]}
            size={size}
            round={0}
            onErrorHide={false}
            onError={() => {
                setIdx((i) => (i + 1 < urls.length ? i + 1 : i));
            }}
        />
    );
}

/* ===================== 상수/유틸 ===================== */
const QUEUE_LABEL = {
    420: "개인/2인 랭크 게임",
    440: "자유 랭크",
    450: "칼바람 나락",
    430: "일반(드래프트)",
    400: "일반(블라인드)",
};
const queueLabel = (q) => QUEUE_LABEL[q] || "기타 큐";

const SPELL_KEY = {
    1: "SummonerBoost",
    3: "SummonerExhaust",
    4: "SummonerFlash",
    6: "SummonerHaste",
    7: "SummonerHeal",
    11: "SummonerSmite",
    12: "SummonerTeleport",
    13: "SummonerMana",
    14: "SummonerDot",
    21: "SummonerBarrier",
};

const RUNE_STYLE_NAME = {
    8000: "Precision",
    8100: "Domination",
    8200: "Sorcery",
    8300: "Inspiration",
    8400: "Resolve",
};

function displayTier(tier, rank) {
    if (!tier) return "-";
    const niceTier = tier.charAt(0) + tier.slice(1).toLowerCase();
    const map = { I: "1", II: "2", III: "3", IV: "4" };
    return `${niceTier} ${map[rank] ?? rank ?? ""}`.trim();
}
function winRate(w = 0, l = 0) {
    const t = w + l;
    if (!t) return "-";
    return Math.round((w / t) * 100) + "%";
}
function fmtDate(ms) {
    if (!ms) return "-";
    try {
        return new Date(ms).toLocaleString();
    } catch {
        return String(ms);
    }
}
function timeAgo(ms) {
    try {
        const diff = Date.now() - Number(ms);
        if (isNaN(diff)) return "-";
        const sec = Math.floor(diff / 1000);
        if (sec < 60) return `${sec}초 전`;
        const min = Math.floor(sec / 60);
        if (min < 60) return `${min}분 전`;
        const hr = Math.floor(min / 60);
        if (hr < 24) return `${hr}시간 전`;
        const day = Math.floor(hr / 24);
        return `${day}일 전`;
    } catch {
        return "-";
    }
}
function fmtDuration(seconds = 0) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const p2 = (n) => n.toString().padStart(2, "0");
    return h > 0 ? `${h}:${p2(m)}:${p2(sec)}` : `${m}:${p2(sec)}`;
}

const ddVer = "15.18.1";

/* 이미지 URL 유틸 */
const champImg = (name) =>
    name ? `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${name}.png` : null;
const spellImg = (id) =>
    id && SPELL_KEY[id]
        ? `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/spell/${SPELL_KEY[id]}.png`
        : null;
const runeStyleImg = (styleId) =>
    styleId && RUNE_STYLE_NAME[styleId]
        ? `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${RUNE_STYLE_NAME[styleId]}/${RUNE_STYLE_NAME[styleId]}.png`
        : null;
const itemImg = (id) =>
    id && id !== 0 ? `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/item/${id}.png` : null;
const tierEmblem = (tier) =>
    tier
        ? `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${tier.toLowerCase()}.png`
        : null;

/* 파생 값 */
const kdaRatio = (k, d, a) => ((k + a) / Math.max(1, d)).toFixed(1);
const csPerMin = (cs, seconds) => (cs / Math.max(1, seconds / 60)).toFixed(1);
const multiKillLabel = (n) =>
    n >= 5 ? "펜타킬" : n === 4 ? "쿼드라킬" : n === 3 ? "트리플킬" : n === 2 ? "더블킬" : null;

/* ===================== 작은 컴포넌트 ===================== */
function Img({ src, alt, size = 20, round = 6, className, onErrorHide = true, onError }) {
    if (!src) return <span style={{ width: size, height: size, display: "inline-block" }} />;
    return (
        <img
            src={src}
            alt={alt || ""}
            width={size}
            height={size}
            className={className}
            style={{ borderRadius: round }}
            onError={(e) => {
                if (onError) onError(e);
                else if (onErrorHide) e.currentTarget.style.display = "none";
            }}
        />
    );
}

function SpellPair({ s1, s2 }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Img src={spellImg(s1)} size={20} round={4} />
            <Img src={spellImg(s2)} size={20} round={4} />
        </div>
    );
}

function RunePair({ primary, sub }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Img src={runeStyleImg(primary)} size={20} round={10} />
            <Img src={runeStyleImg(sub)} size={20} round={10} />
        </div>
    );
}

function ItemsRow({ items = [], trinket }) {
    return (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {items.map((id, i) => (
                <Img key={i} src={itemImg(id)} size={26} round={6} />
            ))}
            <div style={{ width: 6 }} />
            <Img src={itemImg(trinket)} size={26} round={6} />
        </div>
    );
}

function TeamParticipants({ list = [], title }) {
    return (
        <div>
            <div className="mutedSmall" style={{ marginBottom: 4 }}>{title}</div>
            <div style={{ display: "grid", gap: 6 }}>
                {list.map((p, idx) => {
                    const name = p.riotIdGameName && p.riotIdTagline
                        ? `${p.riotIdGameName}#${p.riotIdTagline}`
                        : (p.riotIdGameName || p.summonerName || "Unknown");
                    return (
                        <div key={p.puuid || p.participantId || `${p.championName}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Img src={champImg(p.championName)} size={18} />
                            <div className="mutedSmall" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ===================== 플로팅 상세 패널 ===================== */
function DetailRow({ label, children }) {
    return (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="mutedSmall" style={{ width: 90 }}>{label}</div>
            <div>{children}</div>
        </div>
    );
}
// 🔧 추가: 이름 폴백 유틸 (PUUID 안보임)
function getDisplayName(p, idxFallback = 0) {
    // 1) Riot ID full (gameName#tagLine)
    if (p?.riotIdGameName && p?.riotIdTagline) {
        return `${p.riotIdGameName}#${p.riotIdTagline}`;
    }
    // 2) Riot ID gameName만 있는 경우
    if (p?.riotIdGameName) return p.riotIdGameName;
    // 3) 구 API 소환사명
    if (p?.summonerName) return p.summonerName;
    // 4) 마지막 폴백: 플레이어 넘버 (PUUID 미노출)
    const no = p?.participantId ?? (idxFallback + 1);
    return `Player ${no}`;
}

function ParticipantLine({ p }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "24px 44px 1fr auto auto 220px", gap: 8, alignItems: "center" }}>
            <Img src={champImg(p.championName)} size={24} />
            <div style={{ display: "flex", gap: 6 }}>
                <Img src={spellImg(p.spell1Id)} size={20} round={4} />
                <Img src={spellImg(p.spell2Id)} size={20} round={4} />
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.riotIdGameName && p.riotIdTagline
                    ? `${p.riotIdGameName}#${p.riotIdTagline}`
                    : (p.riotIdGameName || p.summonerName || "Unknown")}
            </div>

            <div className="mutedSmall" style={{ textAlign: "right" }}>
                {p.kills}/{p.deaths}/{p.assists} · {p.kda} KDA
            </div>
            <div className="mutedSmall" style={{ textAlign: "right" }}>
                KP {(Math.round((p.killParticipation ?? 0) * 1000) / 10).toFixed(1)}%
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <ItemsRow items={[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5]} trinket={p.item6} />
            </div>
        </div>
    );
}

function DetailPanel({ open, onClose, detail, loading, error }) {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(980px, 92vw)", maxHeight: "86vh", overflow: "auto",
                    background: "#0b1220", color: "#e5e7eb", border: "1px solid #1f2937",
                    borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", padding: 16
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, flex: 1 }}>
                        매치 상세 {detail?.matchId ? `· ${detail.matchId}` : ""}
                    </div>
                    <button className="tabBtn" onClick={onClose}>닫기</button>
                </div>

                {loading ? (
                    <div className="muted" style={{ padding: 20 }}>불러오는 중…</div>
                ) : error ? (
                    <div style={{ color: "#f87171", padding: 20 }}>로드 실패: {error}</div>
                ) : !detail ? (
                    <div className="muted" style={{ padding: 20 }}>데이터 없음</div>
                ) : (
                    <>
                        {/* 상단: 기본 정보 */}
                        <div className="card" style={{ padding: 12, marginTop: 10 }}>
                            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                <DetailRow label="큐 타입">{queueLabel(detail.queueId)}</DetailRow>
                                <DetailRow label="게임 시간">{fmtDuration(detail.gameDuration)}</DetailRow>
                                <DetailRow label="시작">{fmtDate(detail.gameCreation)}</DetailRow>
                            </div>
                        </div>

                        {/* 팀 요약 */}
                        <div className="card" style={{ padding: 12, marginTop: 10 }}>
                            <div className="mutedSmall" style={{ marginBottom: 8 }}>팀 요약</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {detail.teams?.map((t) => (
                                    <div key={t.teamId} className={t.win ? "winBorder" : "loseBorder"} style={{ borderRadius: 8, padding: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <div style={{ fontWeight: 800 }}>
                                                {t.teamId === 100 ? "블루 팀" : "레드 팀"} · {t.win ? "승리" : "패배"}
                                            </div>
                                            <div className="mutedSmall">팀킬 {t.championKills ?? "-"}</div>
                                        </div>
                                        <div className="mutedSmall">
                                            바론 {t.objectives?.baron ?? 0} · 드래곤 {t.objectives?.dragon ?? 0} · 타워 {t.objectives?.tower ?? 0} · 억제기 {t.objectives?.inhibitor ?? 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 참가자 10명 */}
                        <div className="card" style={{ padding: 12, marginTop: 10 }}>
                            <div className="mutedSmall" style={{ marginBottom: 8 }}>참가자</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                                {detail.participants
                                    ?.slice()
                                    ?.sort((a, b) => (a.teamId - b.teamId) || (a.participantId - b.participantId))
                                    ?.map((p, i) => <ParticipantLine key={p.puuid || i} p={p} />)}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
/* ===================== 랭크 패널 ===================== */
function RankRow({ label, value }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8 }}>
            <div className="mutedSmall">{label}</div>
            <div>{value}</div>
        </div>
    );
}

function RankCard({ title, entry }) {
    if (!entry) {
        return (
            <div className="card" style={{ padding: 14 }}>
                <div className="mutedSmall" style={{ marginBottom: 8 }}>{title}</div>
                <div className="muted">Unranked</div>
            </div>
        );
    }

    const tierText = displayTier(entry.tier, entry.rank); // ex) "Grandmaster 1"
    const emblem = tierEmblem(entry.tier);
    const wr = winRate(entry.wins, entry.losses);

    return (
        <div className="card" style={{ padding: 14 }}>
            <div className="mutedSmall" style={{ marginBottom: 8 }}>{title}</div>

            {/* 🔽 티어 텍스트 + 이미지 나란히 표시 */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 8,
                marginBottom: 10
            }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{tierText}</div>
                <EmblemImg tier={entry.tier} rank={entry.rank} size={36} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
                <RankRow label="LP" value={`${entry.leaguePoints} LP`} />
                <RankRow label="승률" value={wr} />
                <RankRow label="승패" value={`${entry.wins}승 ${entry.losses}패`} />
                <RankRow label="핫스트릭" value={entry.hotStreak ? "예" : "아니오"} />
                <RankRow label="베테랑" value={entry.veteran ? "예" : "아니오"} />
                <RankRow label="신규 진입" value={entry.freshBlood ? "예" : "아니오"} />
                <RankRow label="비활성" value={entry.inactive ? "예" : "아니오"} />
            </div>
        </div>
    );
}

function RankPanel({ solo, flex }) {
    const [rankTab, setRankTab] = React.useState("solo"); // 'solo' | 'flex'
    const entry = rankTab === "solo" ? solo : flex;
    const title = rankTab === "solo" ? "솔로 랭크" : "자유 랭크";

    // 둘 다 없으면 전체 패널을 숨김
    if (!solo && !flex) return null;

    return (
        <div style={{ marginTop: 10 }}>
            <div className="tabs" style={{ gap: 6, marginBottom: 8 }}>
                <button
                    type="button"
                    className={`tabBtn ${rankTab === "solo" ? "tabBtnActive" : ""}`}
                    onClick={() => setRankTab("solo")}
                >
                    솔로랭크
                </button>
                <button
                    type="button"
                    className={`tabBtn ${rankTab === "flex" ? "tabBtnActive" : ""}`}
                    onClick={() => setRankTab("flex")}
                >
                    자유랭크
                </button>
            </div>
            <RankCard title={title} entry={entry} />
        </div>
    );
}


/* ===================== 카드 ===================== */
function MatchCard({ match, focusPuuid, viewerRanks, onOpenDetail }) {
    const me = useMemo(() => {
        const list = Array.isArray(match.participants) ? match.participants : [];
        return list.find((p) => p?.puuid === focusPuuid) || list[0];
    }, [match, focusPuuid]);

    if (!match || !me) return null;

    const won = !!me.win;
    const k = me.kills ?? 0;
    const d = me.deaths ?? 0;
    const a = me.assists ?? 0;
    const cs = me.csTotal ?? 0;
    const ratio = kdaRatio(k, d, a);
    const cpm = csPerMin(cs, match.gameDuration || 1);
    const mk = multiKillLabel(me.largestMultiKill || 0);

    const champ = me.championName || "Aatrox";
    // 1순위: 해당 큐의 랭크, 2순위: 다른 큐, 3순위: TFT(원하면)
    let viewerRankEntry = null;

    if (match.queueId === 420) {
        viewerRankEntry = viewerRanks?.soloRanked
            ?? viewerRanks?.flexRanked
            ?? viewerRanks?.tftRanked
            ?? null;
    } else if (match.queueId === 440) {
        viewerRankEntry = viewerRanks?.flexRanked
            ?? viewerRanks?.soloRanked
            ?? viewerRanks?.tftRanked
            ?? null;
    } else {
        // 일반/칼바람 등: 그냥 가장 대표 랭크(솔랭 우선) 보여주기
        viewerRankEntry = viewerRanks?.soloRanked
            ?? viewerRanks?.flexRanked
            ?? viewerRanks?.tftRanked
            ?? null;
    }

    const tierText = viewerRankEntry ? displayTier(viewerRankEntry.tier, viewerRankEntry.rank) : "Unranked";

    const blue = (match.participants || []).filter((p) => p.teamId === 100);
    const red = (match.participants || []).filter((p) => p.teamId === 200);

    return (
        <div className={`matchCard ${won ? "winBorder" : "loseBorder"}`}>

            {/* 헤더 */}
            <div className="matchHeader">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Img src={champImg(champ)} size={46} round={8} />
                    <div>
                        <div style={{ fontWeight: 800, color: won ? "#a7f3d0" : "#fecaca" }}>
                            {won ? "승리" : "패배"}
                        </div>
                        <div className="mutedSmall">
                            {queueLabel(match.queueId)} · {fmtDuration(match.gameDuration)}
                        </div>
                    </div>
                </div>
                <div className="mutedSmall">{timeAgo(match.gameCreation)}</div>
            </div>

            {/* 본문 상단: 스펠/룬 + KDA/CS + 티어 */}
            <div className="matchBody" style={{ alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <SpellPair s1={me.summoner1Id} s2={me.summoner2Id} />
                    <RunePair primary={me.primaryStyleId} sub={me.subStyleId} />
                </div>

                <div className="sep" />

                <div className="kdaBox">
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                        {k} / {d} / {a}
                    </div>
                    <div className="mutedSmall">K / D / A</div>
                    <div className="mutedSmall" style={{ marginTop: 4 }}>평점 {ratio}:1</div>
                </div>

                <div className="sep" />

                <div>
                    <div style={{ fontWeight: 700 }}>{cs}</div>
                    <div className="mutedSmall">CS</div>
                    <div className="mutedSmall">분당 {cpm}</div>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <EmblemImg tier={viewerRankEntry?.tier} size={28} />
                    <div style={{ textAlign: "right" }}>
                        <div className="mutedSmall">티어</div>
                        <div>{tierText}</div>
                    </div>
                </div>
            </div>

            {/* 내 아이템 + 배지 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px" }}>
                <div>
                    <div className="mutedSmall">내 아이템</div>
                    <ItemsRow
                        items={[me.item0, me.item1, me.item2, me.item3, me.item4, me.item5]}
                        trinket={me.item6}
                    />
                </div>
                <div>
                    {mk && <span className="badge">{mk}</span>}
                </div>
            </div>

            {/* 참가자 10명 (블루/레드) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 10px" }}>
                <TeamParticipants title="블루 팀" list={blue} />
                <TeamParticipants title="레드 팀" list={red} />
            </div>

            {/* 플로팅(상세) 버튼 - 여기서 호출 */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 10px" }}>
                <button type="button" className="tabBtn" onClick={() => onOpenDetail?.(match.matchId)}>
                    상세 보기
                </button>
            </div>
        </div>
    );
}

/* ===================== 리스트/페이지 ===================== */
function MatchList({ matches, focusPuuid, viewerRanks, onOpenDetail }) {
    if (!matches?.length) {
        return (
            <div className="card">
                <div className="empty">최근 전적이 없습니다.</div>
            </div>
        );
    }
    return (
        <div style={{ display: "grid", gap: 10 }}>
            {matches.map((m) => (
                <MatchCard
                    key={m.matchId}
                    match={m}
                    focusPuuid={focusPuuid}
                    viewerRanks={viewerRanks}
                    onOpenDetail={onOpenDetail}
                />
            ))}
        </div>
    );
}
async function fetchJsonSafe(input, init) {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text(); // 먼저 텍스트로 받기

    if (!res.ok) {
        // 서버가 에러 바디를 문자열로 보냈을 수도 있으니 함께 보여주기
        const snippet = text ? `\n${text.slice(0, 500)}` : "";
        throw new Error(`HTTP ${res.status}${snippet}`);
    }

    // 204 No Content 혹은 빈 바디
    if (!text || text.trim().length === 0) {
        // 백엔드가 비어 있는 바디를 돌려준 케이스
        // 필요하면 여기서 null 반환하거나 에러로 처리
        return null;
    }

    if (contentType.includes("application/json")) {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error(`JSON 파싱 실패: ${e.message}\n원문: ${text.slice(0, 500)}`);
        }
    } else {
        // JSON이 아닌 경우 디버그에 도움 되도록 일부 보여주기
        throw new Error(`응답이 JSON이 아님 (content-type: ${contentType})\n원문: ${text.slice(0, 500)}`);
    }
}

function App() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [view, setView] = useState(null);
    const [matches, setMatches] = useState([]);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchErr, setMatchErr] = useState(null);

    const [matchTab, setMatchTab] = useState("all");

    // === 상세 패널 상태 ===
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailErr, setDetailErr] = useState(null);
    const [detail, setDetail] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        setView(null);
        setMatches([]);
        setLoading(true);
        setMatchLoading(true);
        setMatchErr(null);

        try {
            const g = encodeURIComponent(gameName.trim());
            const t = encodeURIComponent(tagLine.trim());

            const res1 = await fetch(`/api/summoner/view/${g}/${t}`, { method: "POST" });
            if (!res1.ok) throw new Error(`HTTP ${res1.status} - ${await res1.text()}`);
            const v = await res1.json();
            console.log("view =", v);              // 👈 soloRanked / flexRanked 보이나?
            console.log(v?.soloRanked, v?.flexRanked);
            setView(v);

            const res2 = await fetch(`/api/match/recent?gameName=${g}&tagLine=${t}&count=10`);
            if (!res2.ok) throw new Error(`HTTP ${res2.status} - ${await res2.text()}`);
            const m = await res2.json();
            setMatches(Array.isArray(m) ? m : []);
        } catch (e) {
            setErr(String(e));
        } finally {
            setLoading(false);
            setMatchLoading(false);
        }
    };

    // 상세 열기
    async function openMatchDetail(matchId) {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailErr(null);
        setDetail(null);
        try {
            if (!matchId) throw new Error("matchId 없음");

            // 현재 리스트에서 동일한 매치 찾아 참가자 이름 맵 구성 (puuid → {g,t,s})
            const summary = matches.find((m) => m.matchId === matchId);
            const nameMap = new Map();
            if (summary?.participants) {
                summary.participants.forEach((p) => {
                    nameMap.set(p.puuid, {
                        g: p.riotIdGameName || null,
                        t: p.riotIdTagline || null,
                        s: p.summonerName || null,
                    });
                });
            }

            const url = `/api/match/${encodeURIComponent(matchId)}/detail?includeTimeline=false`;
            const json = await fetchJsonSafe(url);
            if (!json) throw new Error("서버가 비어 있는 응답을 반환함 (No Content)");

            // 상세 응답 참가자에 닉네임/태그를 보충
            const enriched = {
                ...json,
                participants: (json.participants || []).map((p) => {
                    const nm = nameMap.get(p.puuid);
                    return {
                        ...p,
                        riotIdGameName: p.riotIdGameName || nm?.g || null,
                        riotIdTagline:  p.riotIdTagline  || nm?.t || null,
                        summonerName:   p.summonerName   || nm?.s || null,
                    };
                }),
            };

            setDetail(enriched);
        } catch (e) {
            setDetailErr(String(e));
        } finally {
            setDetailLoading(false);
        }
    }


    // 탭 필터(솔랭/자랭/기타/전체)
    const QUEUE_SOLO = 420;
    const QUEUE_FLEX = 440;
    const filteredMatches = useMemo(() => {
        if (!Array.isArray(matches)) return [];
        return matches
            .filter((m) => {
                const q = m?.queueId;
                if (matchTab === "solo") return q === QUEUE_SOLO;
                if (matchTab === "flex") return q === QUEUE_FLEX;
                if (matchTab === "other") return q !== QUEUE_SOLO && q !== QUEUE_FLEX;
                return true;
            })
            .sort((a, b) => (b.gameCreation ?? 0) - (a.gameCreation ?? 0));
    }, [matches, matchTab]);

    return (
        <div className="App">
            <form id="searchForm" onSubmit={onSubmit} className="form">
                <label>
                    닉네임:{" "}
                    <input
                        type="text"
                        id="gameName"
                        name="gameName"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    태그:{" "}
                    <input
                        type="text"
                        id="tagLine"
                        name="tagLine"
                        value={tagLine}
                        onChange={(e) => setTagLine(e.target.value)}
                    />
                </label>
                <br />
                <button type="submit" disabled={loading || matchLoading}>
                    제출
                </button>
            </form>

            {err && <div style={{ color: "#f87171" }}>요청 실패: {err}</div>}

            {view ? (
                <div className="twoCols">
                    <div className="leftCol">
                        {/* 프로필 */}
                        <div className="profile">
                            <div className="iconWrap">
                                <Img
                                    src={`https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/${view.profileIconId}.png`}
                                    size={64}
                                    round={8}
                                />
                                <div className="levelBadge">{view.summonerLevel ?? ""}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 900 }}>
                                    {view.gameName} <span className="muted">#{view.tagLine}</span>
                                </div>
                                <div className="muted">마지막 수정: {fmtDate(view.revisionDate)}</div>
                            </div>
                        </div>
                        <RankPanel solo={view.soloRanked} flex={view.flexRanked} />

                        {/* 전적 탭(필터) */}
                        <div className="tabs" style={{ gap: 6 }}>
                            <button
                                type="button"
                                className={`tabBtn ${matchTab === "all" ? "tabBtnActive" : ""}`}
                                onClick={() => setMatchTab("all")}
                            >
                                전체
                            </button>
                            <button
                                type="button"
                                className={`tabBtn ${matchTab === "solo" ? "tabBtnActive" : ""}`}
                                onClick={() => setMatchTab("solo")}
                            >
                                솔로랭크
                            </button>
                            <button
                                type="button"
                                className={`tabBtn ${matchTab === "flex" ? "tabBtnActive" : ""}`}
                                onClick={() => setMatchTab("flex")}
                            >
                                자유랭크
                            </button>
                            <button
                                type="button"
                                className={`tabBtn ${matchTab === "other" ? "tabBtnActive" : ""}`}
                                onClick={() => setMatchTab("other")}
                            >
                                기타
                            </button>
                        </div>
                    </div>

                    <div className="rightCol">
                        <div className="colHeader">최근 매치</div>
                        {matchLoading ? (
                            <div className="muted">전적 불러오는 중…</div>
                        ) : matchErr ? (
                            <div style={{ color: "#f87171" }}>전적 로드 실패: {matchErr}</div>
                        ) : (
                            <MatchList
                                matches={filteredMatches}
                                focusPuuid={view.puuid}
                                viewerRanks={view}
                                onOpenDetail={openMatchDetail}
                            />
                        )}
                    </div>
                </div>
            ) : null}

            {/* 플로팅 상세 패널 */}
            <DetailPanel
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                detail={detail}
                loading={detailLoading}
                error={detailErr}
            />
        </div>
    );
}

export default App;
