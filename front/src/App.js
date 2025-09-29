// src/App.js
import { useState } from "react";
import "./App.css";

function App() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [view, setView] = useState(null);

    // Data Dragon 버전 (서버에서 내려주도록 나중에 개선해도 됨)
    const ddVer = "15.18.1";

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        setView(null);
        setLoading(true);

        try {
            const g = encodeURIComponent(gameName.trim());
            const t = encodeURIComponent(tagLine.trim());

            const res = await fetch(`/summoner/view/${g}/${t}`, { method: "POST" });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${await res.text()}`);
            }
            const v = await res.json();
            setView(v);
        } catch (e) {
            setErr(String(e));
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (loading) return <div className="row">불러오는 중…</div>;

        // 요청 성공
        if (view) {
            const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/profileicon/${view.profileIconId}.png`;
            return (
                <div>
                    <div className="row"><strong>Riot ID</strong> : {view.gameName}#{view.tagLine}</div>
                    <div className="row"><strong>닉네임</strong> : {view.gameName}</div>
                    <div className="row"><strong>태그</strong> : #{view.tagLine}</div>
                    <div className="row"><strong>PUUID</strong> : {view.puuid}</div>
                    <div className="row"><strong>레벨</strong> : {view.summonerLevel ?? ""}</div>
                    <div className="row"><strong>마지막 수정 시간</strong> : {view.revisionDate ?? ""}</div>
                    <div className="row">
                        <strong>아이콘</strong> :{" "}
                        <img
                            src={iconUrl}
                            alt="profile icon"
                            width={64}
                            height={64}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    </div>
                </div>
            );
        }

        // 요청 실패 (에러가 있을 때만 하드코딩 값)
        if (err) {
            return (
                <div>
                    <div className="row"><strong>Riot ID</strong> : Riot#ID</div>
                    <div className="row"><strong>닉네임</strong> : 닉네임</div>
                    <div className="row"><strong>태그</strong> : #KR1</div>
                    <div className="row"><strong>PUUID</strong> : DEFAULT-PUUID</div>
                    <div className="row"><strong>레벨</strong> : 999</div>
                    <div className="row"><strong>마지막 수정 시간</strong> : 2025-09-29</div>
                    <div className="row"><strong>아이콘</strong> : 아이콘</div>
                </div>
            );
        }

        // 제출 전에는 아무것도 안 보이게
        return null;
    };



    return (
        <div className="App">
            <form id="searchForm" onSubmit={onSubmit}>
                닉네임 :{" "}
                <input
                    type="text"
                    id="gameName"
                    name="gameName"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                />
                <br />
                태그 :{" "}
                <input
                    type="text"
                    id="tagLine"
                    name="tagLine"
                    value={tagLine}
                    onChange={(e) => setTagLine(e.target.value)}
                />
                <br />
                <button type="submit" disabled={loading}>제출</button>
            </form>

            <div id="result" style={{ marginTop: 12 }}>{renderResult()}</div>
        </div>
    );
}

export default App;