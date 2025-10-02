// src/App.js
import { useMemo, useState } from "react";
import "./App.css";

const Q_SOLO = "RANKED_SOLO_5x5";
const Q_FLEX = "RANKED_FLEX_SR";

// ===== 공통 유틸 =====
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

// ===== 프리젠테이션 컴포넌트 =====
function RankCard({ entry, title }) {
    if (!entry) {
        return (
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>{title}</div>
                    <div style={styles.muted}>데이터 없음</div>
                </div>
                <div style={styles.empty}>해당 큐에서 배치/랭크 기록이 없습니다.</div>
            </div>
        );
    }
    const tierText = displayTier(entry.tier, entry.rank);
    const urls = tierEmblemUrls(entry.tier);
    const primary = urls[0];
    const fallback = urls[1];

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div>{title}</div>
                <div style={styles.muted}>
                    {entry.wins ?? 0}승 {entry.losses ?? 0}패
                </div>
            </div>

            <div style={styles.rankRow}>
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
                <div style={styles.tierText}>{tierText}</div>
            </div>

            <div style={styles.grid}>
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
        return list.find(p => p?.puuid === focusPuuid) || list[0];
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
        <div
            style={{
                ...styles.matchCard,
                borderLeft: `4px solid ${won ? "#4ade80" : "#f87171"}`,
            }}
        >
            <div style={styles.matchHeader}>
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
                        <div style={styles.mutedSmall}>
                            {match.gameMode || "CLASSIC"} · {fmtDuration(match.gameDuration)}
                        </div>
                    </div>
                </div>

                <div style={styles.mutedSmall}>{timeAgo(match.gameCreation)}</div>
            </div>

            <div style={styles.matchBody}>
                <div style={styles.kdaBox}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                        {k} / {d} / {a}
                    </div>
                    <div style={styles.mutedSmall}>K / D / A</div>
                </div>

                <div style={styles.sep} />

                <div>
                    <div style={{ fontWeight: 700 }}>{cs}</div>
                    <div style={styles.mutedSmall}>CS</div>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ textAlign: "right" }}>
                    <div style={styles.mutedSmall}>버전</div>
                    <div>{match.gameVersion}</div>
                </div>
            </div>
        </div>
    );
}

function MatchList({ matches, ddVer, focusPuuid }) {
    if (!matches?.length) {
        return (
            <div style={styles.card}>
                <div style={styles.empty}>최근 전적이 없습니다.</div>
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

    const renderProfile = () => {
        if (!view) return null;
        const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/${view.profileIconId}.png`;
        return (
            <div style={styles.profile}>
                <div style={styles.iconWrap}>
                    <img
                        src={iconUrl}
                        alt="profile icon"
                        width={64}
                        height={64}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        style={{ borderRadius: 8, display: "block" }}
                    />
                    <div style={styles.levelBadge}>{view.summonerLevel ?? ""}</div>
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>
                        {view.gameName} <span style={styles.muted}>#{view.tagLine}</span>
                    </div>
                    <div style={{ margin: "6px 0" }}>
                        <span style={styles.badge}>PUUID</span> {view.puuid}
                    </div>
                    <div style={styles.muted}>마지막 수정: {fmtDate(view.revisionDate)}</div>
                </div>
            </div>
        );
    };

    const renderTabs = () => {
        if (!view) return null;
        const solo =
            view.soloRanked && view.soloRanked.queueType === Q_SOLO
                ? view.soloRanked
                : view.soloRanked || null;
        const flex =
            view.flexRanked && view.flexRanked.queueType === Q_FLEX
                ? view.flexRanked
                : view.flexRanked || null;

        return (
            <>
                <div style={styles.tabs}>
                    <button
                        type="button"
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "solo" ? styles.tabBtnActive : {}),
                        }}
                        onClick={() => setActiveTab("solo")}
                    >
                        솔로 랭크
                    </button>
                    <button
                        type="button"
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === "flex" ? styles.tabBtnActive : {}),
                        }}
                        onClick={() => setActiveTab("flex")}
                    >
                        자유 랭크
                    </button>
                </div>

                <div style={{ marginTop: 8 }}>
                    {activeTab === "solo" && <RankCard entry={solo} title="솔로 랭크" />}
                    {activeTab === "flex" && <RankCard entry={flex} title="자유 랭크" />}
                </div>
            </>
        );
    };

    const renderLeftPane = () => {
        if (loading) return <div className="row">불러오는 중…</div>;
        if (err)
            return (
                <div className="row" style={{ color: "#f87171" }}>
                    요청 실패: {err}
                </div>
            );
        if (!view) return null;

        return (
            <div>
                {renderProfile()}
                {renderTabs()}
            </div>
        );
    };

    const renderRightPane = () => {
        if (!view) return null;
        if (matchLoading) return <div style={styles.muted}>전적 불러오는 중…</div>;
        if (matchErr) return <div style={{ color: "#f87171" }}>전적 로드 실패: {matchErr}</div>;
        return (
            <div>
                <div style={styles.colHeader}>최근 매치</div>
                <MatchList matches={matches} ddVer={ddVer} focusPuuid={view.puuid} />
            </div>
        );
    };

    return (
        <div className="App" style={styles.app}>
            <form id="searchForm" onSubmit={onSubmit} style={styles.form}>
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

            {view ? (
                <div style={styles.twoCols}>
                    <div style={styles.leftCol}>{renderLeftPane()}</div>
                    <div style={styles.rightCol}>{renderRightPane()}</div>
                </div>
            ) : null}
        </div>
    );
}

/* ---- 스타일 ---- */
const styles = {
    app: { color: "#eaeaea", background: "#1f1f1f", minHeight: "100vh", padding: 16 },
    form: { marginBottom: 8 },
    muted: { color: "#94a3b8" },
    mutedSmall: { color: "#9fb0bf", fontSize: 12 },
    badge: {
        display: "inline-block",
        background: "#36404a",
        color: "#cfe4ff",
        padding: "2px 6px",
        borderRadius: 6,
        fontSize: 12,
        marginRight: 6,
    },
    twoCols: {
        display: "grid",
        gridTemplateColumns: "minmax(320px, 520px) 1fr",
        gap: 16,
        alignItems: "start",
        marginTop: 12,
    },
    leftCol: { display: "grid", gap: 12 },
    rightCol: { display: "grid", gap: 12 },
    profile: {
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 12,
        alignItems: "center",
        background: "#2a2a2a",
        borderRadius: 10,
        padding: 12,
        marginBottom: 4,
    },
    iconWrap: { position: "relative", width: 64, height: 64 },
    levelBadge: {
        position: "absolute",
        bottom: -6,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0e1a24",
        color: "#cfe4ff",
        padding: "2px 6px",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 12,
        border: "1px solid #0c151d",
    },
    tabs: { display: "flex", gap: 6, margin: "16px 0 8px" },
    tabBtn: {
        background: "#343a40",
        border: "1px solid #444",
        color: "#d7e3f4",
        padding: "6px 12px",
        borderRadius: 8,
        cursor: "pointer",
    },
    tabBtnActive: { background: "#5b9bd5", borderColor: "#5b9bd5", color: "#081018", fontWeight: 700 },
    card: {
        background: "#23262b",
        border: "1px solid #353b42",
        borderRadius: 10,
        padding: 14,
        minWidth: 280,
        maxWidth: 520,
    },
    colHeader: {
        fontWeight: 900,
        color: "#cfd9e4",
        fontSize: 16,
        borderBottom: "1px solid #37424a",
        paddingBottom: 6,
        marginBottom: 6,
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 6,
        borderBottom: "1px solid #37424a",
        paddingBottom: 6,
        color: "#cfd9e4",
        fontWeight: 700,
    },
    tierText: { fontSize: 22, fontWeight: 800, color: "#ffd37e", marginBottom: 6 },
    rankRow: { display: "flex", alignItems: "center", marginBottom: 6 },
    grid: { display: "grid", gridTemplateColumns: "auto auto", gap: "6px 16px", color: "#b7c3cf" },
    empty: { color: "#9aa7b4", fontStyle: "italic" },

    // 매치 카드
    matchCard: {
        background: "#23262b",
        border: "1px solid #353b42",
        borderRadius: 10,
        padding: 12,
    },
    matchHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    matchBody: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    kdaBox: {
        background: "#1c2228",
        border: "1px solid #2b3640",
        padding: "6px 10px",
        borderRadius: 8,
        textAlign: "center",
        minWidth: 96,
    },
    sep: { width: 1, alignSelf: "stretch", background: "#36414a", opacity: 0.7 },
};


export default App;
