// src/App.jsx
import React, { useMemo, useState } from "react";
import "./App.css";

const Q_SOLO = "RANKED_SOLO_5x5";
const Q_FLEX = "RANKED_FLEX_SR";

// ===== 유틸 함수 =====
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
function tierEmblemUrls(tier) {
    if (!tier) return [];
    const t = tier.toLowerCase();
    return [
        `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${t}.png`,
        `https://opgg-static.akamaized.net/images/medals_new/${t}.png`,
    ];
}

// ===== 컴포넌트 =====
function RankCard({ entry, title }) {
    if (!entry) {
        return (
            <div className="card">
                <div className="cardHeader">
                    <div>{title}</div>
                    <div className="muted">데이터 없음</div>
                </div>
                <div className="empty">해당 큐에서 배치/랭크 기록이 없습니다.</div>
            </div>
        );
    }
    const tierText = displayTier(entry.tier, entry.rank);
    const urls = tierEmblemUrls(entry.tier);
    const primary = urls[0];
    const fallback = urls[1];

    return (
        <div className="card">
            <div className="cardHeader">
                <div>{title}</div>
                <div className="muted">
                    {entry.wins ?? 0}승 {entry.losses ?? 0}패
                </div>
            </div>

            <div className="rankRow">
                {entry.tier && (
                    <img
                        src={primary}
                        alt={entry.tier}
                        width={64}
                        height={64}
                        style={{ marginRight: 12 }}
                        onError={(e) => {
                            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                            else e.currentTarget.style.display = "none";
                        }}
                    />
                )}
                <div className="tierText">{tierText}</div>
            </div>

            <div className="grid">
                <div>LP</div>
                <div>{entry.leaguePoints ?? 0} LP</div>

                <div>승률</div>
                <div>{winRate(entry.wins, entry.losses)}</div>

                <div>핫스트릭</div>
                <div>{entry.hotStreak ? "예" : "아니오"}</div>

                <div>베테랑</div>
                <div>{entry.veteran ? "예" : "아니오"}</div>

                <div>신규 진입</div>
                <div>{entry.freshBlood ? "예" : "아니오"}</div>

                <div>비활성</div>
                <div>{entry.inactive ? "예" : "아니오"}</div>
            </div>
        </div>
    );
}

function MatchCard({ match, ddVer, focusPuuid }) {
    const me = useMemo(() => {
        const list = Array.isArray(match.participants) ? match.participants : [];
        return list.find((p) => p?.puuid === focusPuuid) || list[0];
    }, [match, focusPuuid]);

    if (!match) return null;

    const won = !!me?.win;
    const k = me?.kills ?? 0;
    const d = me?.deaths ?? 0;
    const a = me?.assists ?? 0;
    const cs = me?.totalMinionsKilled ?? 0;

    const champ = me?.championName || "Aatrox";
    const champSquare = `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${champ}.png`;

    return (
        <div className={`matchCard ${won ? "winBorder" : "loseBorder"}`}>
            <div className="matchHeader">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                        src={champSquare}
                        alt={champ}
                        width={46}
                        height={46}
                        style={{ borderRadius: 8 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div>
                        <div style={{ fontWeight: 800, color: won ? "#a7f3d0" : "#fecaca" }}>
                            {won ? "승리" : "패배"}
                        </div>
                        <div className="mutedSmall">
                            {match.gameMode || "CLASSIC"} · {fmtDuration(match.gameDuration)}
                        </div>
                    </div>
                </div>
                <div className="mutedSmall">{timeAgo(match.gameCreation)}</div>
            </div>

            <div className="matchBody">
                <div className="kdaBox">
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                        {k} / {d} / {a}
                    </div>
                    <div className="mutedSmall">K / D / A</div>
                </div>

                <div className="sep" />

                <div>
                    <div style={{ fontWeight: 700 }}>{cs}</div>
                    <div className="mutedSmall">CS</div>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ textAlign: "right" }}>
                    <div className="mutedSmall">버전</div>
                    <div>{match.gameVersion}</div>
                </div>
            </div>
        </div>
    );
}

function MatchList({ matches, ddVer, focusPuuid }) {
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
                <MatchCard key={m.matchId} match={m} ddVer={ddVer} focusPuuid={focusPuuid} />
            ))}
        </div>
    );
}

// ===== 메인 =====
function App() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [view, setView] = useState(null);
    const [activeTab, setActiveTab] = useState("solo");

    const [matches, setMatches] = useState([]);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchErr, setMatchErr] = useState(null);

    const ddVer = "15.18.1";

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        setView(null);
        setMatches([]);
        setLoading(true);
        setMatchLoading(true);
        setMatchErr(null);
        setActiveTab("solo");

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
                        <div className="profile">
                            {/* 프로필 정보 */}
                            <div className="iconWrap">
                                <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/${view.profileIconId}.png`}
                                    alt="profile icon"
                                    width={64}
                                    height={64}
                                    style={{ borderRadius: 8 }}
                                    onError={(e) => (e.currentTarget.style.display = "none")}
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

                        {/* 랭크 카드 */}
                        <div className="tabs">
                            <button
                                type="button"
                                className={`tabBtn ${activeTab === "solo" ? "tabBtnActive" : ""}`}
                                onClick={() => setActiveTab("solo")}
                            >
                                솔로 랭크
                            </button>
                            <button
                                type="button"
                                className={`tabBtn ${activeTab === "flex" ? "tabBtnActive" : ""}`}
                                onClick={() => setActiveTab("flex")}
                            >
                                자유 랭크
                            </button>
                        </div>

                        {activeTab === "solo" && <RankCard entry={view.soloRanked} title="솔로 랭크" />}
                        {activeTab === "flex" && <RankCard entry={view.flexRanked} title="자유 랭크" />}
                    </div>

                    <div className="rightCol">
                        <div className="colHeader">최근 매치</div>
                        {matchLoading ? (
                            <div className="muted">전적 불러오는 중…</div>
                        ) : matchErr ? (
                            <div style={{ color: "#f87171" }}>전적 로드 실패: {matchErr}</div>
                        ) : (
                            <MatchList matches={matches} ddVer={ddVer} focusPuuid={view.puuid} />
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default App;
