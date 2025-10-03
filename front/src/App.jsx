// src/App.jsx
import React, { useMemo, useState } from "react";
import "./App.css";

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
    13: "SummonerMana", // 거의 안 씀
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

const ddVer = "15.18.1"; // 데이터 드래곤 버전

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
function Img({ src, alt, size = 20, round = 6, className, onErrorHide = true }) {
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
                if (onErrorHide) e.currentTarget.style.display = "none";
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

/* 참가자 띄우기 (블루/레드) */
function TeamParticipants({ list = [], title }) {
    return (
        <div>
            <div className="mutedSmall" style={{ marginBottom: 4 }}>{title}</div>
            <div style={{ display: "grid", gap: 6 }}>
                {list.map((p, idx) => {
                    const name = p.riotIdGameName || p.summonerName || p.puuid?.slice(0, 6);
                    return (
                        <div key={p.puuid || idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
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

/* ===================== 카드 ===================== */
function MatchCard({ match, focusPuuid, viewerRanks }) {
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
    const viewerRankEntry =
        match.queueId === 420 ? viewerRanks?.soloRanked : match.queueId === 440 ? viewerRanks?.flexRanked : null;

    const tierText = viewerRankEntry ? displayTier(viewerRankEntry.tier, viewerRankEntry.rank) : "-";
    const tierImg = viewerRankEntry ? tierEmblem(viewerRankEntry.tier) : null;

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
                    {tierImg && <Img src={tierImg} size={28} round={0} />}
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
                    {/* ACE/불운 등은 나중 단계에서 추가 */}
                </div>
            </div>

            {/* 참가자 10명 (블루/레드) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 10px" }}>
                <TeamParticipants title="블루 팀" list={blue} />
                <TeamParticipants title="레드 팀" list={red} />
            </div>

            {/* 플로팅(상세) 버튼 - 내용은 비워둠 */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 10px" }}>
                <button type="button" className="tabBtn" onClick={() => alert("상세 보기(플로팅)는 다음 단계에서 구현합니다.")}>
                    상세 보기
                </button>
            </div>
        </div>
    );
}

/* ===================== 리스트/페이지 ===================== */
function MatchList({ matches, focusPuuid, viewerRanks }) {
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
                <MatchCard key={m.matchId} match={m} focusPuuid={focusPuuid} viewerRanks={viewerRanks} />
            ))}
        </div>
    );
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

            const res1 = await fetch(`/summoner/view/${g}/${t}`, { method: "POST" });
            if (!res1.ok) throw new Error(`HTTP ${res1.status} - ${await res1.text()}`);
            const v = await res1.json();
            setView(v);

            const res2 = await fetch(`/match/recent?gameName=${g}&tagLine=${t}&count=10`);
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
                                <div style={{ margin: "6px 0" }}>
                                    <span className="badge">PUUID</span> {view.puuid}
                                </div>
                                <div className="muted">마지막 수정: {fmtDate(view.revisionDate)}</div>
                            </div>
                        </div>

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
                            <MatchList matches={filteredMatches} focusPuuid={view.puuid} viewerRanks={view} />
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default App;
