import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import boardApi from "../../data/communityApi";
import VoteSection from "./VoteSection";
import MediaAttachment from "./MediaAttachment";
import AutocompleteSearch from "../common/AutocompleteSearch";
import { fetchRecentMatches, fetchDDragonVersion } from "../../data/api";
import { buildChampionSquareUrl, buildItemIconUrl } from "../../data/ddragon";

function WritePost({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "free",
    tags: [],
    writerB: "",
    matchData: null
  });
  const [showVoteSection, setShowVoteSection] = useState(false);
  const [voteData, setVoteData] = useState(null);
  const [attachedMedia, setAttachedMedia] = useState([]);
  const contentEditableRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedSummoner, setSelectedSummoner] = useState(null);
  const [matchList, setMatchList] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [ddVer, setDdVer] = useState('15.18.1');
  
  // DDragon 버전 로드
  useEffect(() => {
    fetchDDragonVersion().then(ver => setDdVer(ver || '15.18.1')).catch(() => {});
  }, []);

  // 매치 데이터 변환 함수
  const transformMatchData = (matches, summoner) => {
    if (!matches || !Array.isArray(matches)) return [];
    
    const queueTypeMap = {
      420: '개인/2인 랭크 게임',
      440: '자유 랭크 게임',
      400: '일반 게임',
      430: '일반 게임',
      450: '무작위 총력전',
    };

    const fmtDuration = (seconds = 0) => {
      const s = Math.max(0, Math.floor(Number(seconds) || 0));
      const m = Math.floor(s / 60);
      const sec = s % 60;
      const p2 = (n) => n.toString().padStart(2, '0');
      return `${m}분 ${p2(sec)}초`;
    };

    const timeAgo = (ms) => {
      const diff = Date.now() - Number(ms || 0);
      if (!isFinite(diff) || diff < 0) return '-';
      const sec = Math.floor(diff / 1000);
      if (sec < 60) return `${sec}초 전`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}분 전`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}시간 전`;
      const day = Math.floor(hr / 24);
      if (day < 7) return `${day}일 전`;
      const week = Math.floor(day / 7);
      if (week < 4) return `${week}주 전`;
      const month = Math.floor(day / 30);
      return `${month}개월 전`;
    };

    return matches.map((m) => {
      const matchId = m?.metadata?.matchId || m?.matchId;
      const info = m?.info || m;
      const participants = Array.isArray(info?.participants) ? info.participants : [];
      
      // 소환사를 찾기 (gameName과 tagLine으로)
      const me = participants.find((p) => {
        const pName = (p?.riotIdGameName || p?.summonerName || '').toLowerCase();
        const pTag = (p?.riotIdTagline || '').toLowerCase();
        const sName = (summoner?.gameName || '').toLowerCase();
        const sTag = (summoner?.tagLine || '').toLowerCase();
        return pName === sName && (!sTag || pTag === sTag);
      }) || participants[0]; // 찾지 못하면 첫 번째 참가자
      
      const isWin = !!me?.win;
      const champ = me?.championName || 'Aatrox';
      
      return {
        matchId,
        gameType: queueTypeMap[info?.queueId] || info?.gameMode || '게임',
        result: isWin ? '승리' : '패배',
        duration: fmtDuration(info?.gameDuration),
        timeAgo: timeAgo(info?.gameCreation),
        champion: {
          name: champ,
          level: me?.champLevel ?? 0,
          imageUrl: buildChampionSquareUrl(ddVer, champ),
        },
        kda: {
          kills: me?.kills ?? 0,
          deaths: me?.deaths ?? 0,
          assists: me?.assists ?? 0,
        },
        gameMode: info?.gameMode,
        queueId: info?.queueId,
        gameCreation: info?.gameCreation,
        gameDuration: info?.gameDuration,
      };
    });
  };

  // 변환된 매치 목록
  const transformedMatchList = useMemo(() => {
    return transformMatchData(matchList, selectedSummoner);
  }, [matchList, selectedSummoner, ddVer]);

  // 수정 모드인지 확인
  const postToEdit = location.state?.postToEdit;
  const isEditMode = !!postToEdit;

  useEffect(() => {
    if (isEditMode && postToEdit) {
      const isLol = (postToEdit.category || "") === "lolmuncheol";
      const initialContent = isLol && currentUser === postToEdit.writerB
        ? (postToEdit.contentB || "")
        : (postToEdit.content || "");
      setFormData({
        title: postToEdit.title || "",
        content: initialContent,
        category: postToEdit.category || "free",
        tags: postToEdit.tags || [],
        writerB: postToEdit.writerB || "",
        matchData: postToEdit.matchData || null
      });
      
      // 투표 데이터가 있으면 표시
      if (postToEdit.vote) {
        setVoteData(postToEdit.vote);
        setShowVoteSection(true);
      }
      
      // 매치 데이터가 있으면 소환사 정보도 설정
      if (postToEdit.matchData) {
        setSelectedSummoner(postToEdit.matchData.summoner || null);
      }
    }
  }, [isEditMode, postToEdit]);

  // 롤문철 글 작성 시 투표 강제 생성
  useEffect(() => {
    if (formData.category === "lolmuncheol" && !isEditMode) {
      // 기본 투표 데이터 생성
      const defaultVoteData = {
        question: "누가 이길까요?",
        options: ["사용자A", "사용자B"],
        description: "",
        hasEndTime: true,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // 7일 후
      };
      setVoteData(defaultVoteData);
      setShowVoteSection(true);
    }
  }, [formData.category, isEditMode]);

  // contentEditable 초기 내용 설정
  useEffect(() => {
    if (contentEditableRef.current && formData.content !== contentEditableRef.current.innerText) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const isAtEnd = range && range.endContainer === contentEditableRef.current && 
                     range.endOffset === contentEditableRef.current.childNodes.length;
      
      contentEditableRef.current.innerText = formData.content;
      
      // 커서가 끝에 있었으면 끝으로 이동
      if (isAtEnd) {
        const newRange = document.createRange();
        newRange.selectNodeContents(contentEditableRef.current);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  }, [formData.content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (formData.category === "lolmuncheol") {
      if (!formData.writerB.trim()) {
        alert("롤문철 카테고리에서는 상대 사용자 닉네임이 필요합니다.");
        return;
      }
    }

    try {
      const payload = { ...formData, writer: currentUser };
      
      // 투표 데이터가 있으면 포함
      if (voteData && voteData.question.trim()) {
        payload.vote = voteData;
      }
      
      // 매치 데이터가 있으면 포함
      if (formData.matchData) {
        payload.matchData = formData.matchData;
      }
      
      if (isEditMode) {
        const isLol = formData.category === "lolmuncheol";
        if (isLol) {
          // 작성자B는 오른쪽 칸만 수정, 작성자A는 왼쪽 칸만 수정
          if (currentUser === postToEdit.writerB) {
            delete payload.content; // 왼쪽 본문은 건드리지 않음
            payload.contentB = formData.content; // 오른쪽 본문 갱신
          } else {
            // 작성자A 또는 관리자: 왼쪽 본문 갱신, 오른쪽은 유지
            delete payload.contentB;
          }
        }
        await boardApi.updatePost(postToEdit.id, payload);
        alert("글이 수정되었습니다.");
      } else {
        await boardApi.createPost(payload);
        alert("글이 작성되었습니다.");
      }
      
      navigate(`/community/${formData.category}`);
    } catch (error) {
      alert("작성 중 오류가 발생했습니다: " + error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoteChange = (newVoteData) => {
    setVoteData(newVoteData);
  };

  const toggleVoteSection = () => {
    // 롤문철 글에서는 투표 섹션을 숨길 수 없음
    if (formData.category === "lolmuncheol") {
      alert("롤문철 글에서는 투표가 필수입니다.");
      return;
    }
    
    setShowVoteSection(!showVoteSection);
    if (showVoteSection) {
      setVoteData(null);
    }
  };

  const handleMediaInsert = async (mediaData) => {
    setAttachedMedia(prev => [...prev, mediaData]);
    
    // contentEditable에 미디어 삽입
    if (contentEditableRef.current) {
      let mediaHtml = '';
      
      if (mediaData.type === 'image') {
        // 이미지는 그대로 삽입
        mediaHtml = `<img src="${mediaData.url}" alt="${mediaData.name}" data-media-id="${mediaData.id}" data-media-type="image" style="max-width: 200px; max-height: 150px; margin: 2px; vertical-align: middle; display: inline-block; border-radius: 4px; object-fit: cover;" contenteditable="false" draggable="false" />`;
      } else if (mediaData.type === 'video') {
        // 비디오는 썸네일 이미지로 삽입
        try {
          const thumbnailUrl = await generateVideoThumbnail(mediaData.url);
          mediaHtml = `<span data-media-id="${mediaData.id}" data-media-type="video" data-video-url="${mediaData.url}" style="position: relative; display: inline-block; max-width: 200px; max-height: 150px; margin: 2px; vertical-align: middle; border-radius: 4px; overflow: hidden;" contenteditable="false" draggable="false">
  <img src="${thumbnailUrl}" alt="${mediaData.name}" style="max-width: 200px; max-height: 150px; display: block; border-radius: 4px; object-fit: cover; pointer-events: none;" draggable="false" />
  <span style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; pointer-events: none;">🎥</span>
</span>`;
        } catch (error) {
          console.error('썸네일 생성 실패:', error);
          // 썸네일 생성 실패 시 비디오 아이콘만 있는 div로 대체
          mediaHtml = `<span data-media-id="${mediaData.id}" data-media-type="video" data-video-url="${mediaData.url}" style="max-width: 200px; max-height: 150px; margin: 2px; vertical-align: middle; display: inline-block; border-radius: 4px; background: #f0f0f0; width: 200px; height: 150px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #ddd;" contenteditable="false"><span style="font-size: 40px;">🎥</span></span>`;
        }
      }
      
      // 현재 커서 위치에 미디어 삽입
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // 미디어 요소 생성
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mediaHtml;
        const mediaElement = tempDiv.firstChild;
        
        // 공백 추가 (백스페이스로 삭제 가능하도록)
        const spaceBefore = document.createTextNode(' ');
        const spaceAfter = document.createTextNode(' ');
        
        // 공백과 미디어 요소를 함께 삽입
        range.insertNode(spaceBefore);
        range.setStartAfter(spaceBefore);
        range.insertNode(mediaElement);
        range.setStartAfter(mediaElement);
        range.insertNode(spaceAfter);
        
        // 커서를 미디어 뒤로 이동
        range.setStartAfter(spaceAfter);
        range.setEndAfter(spaceAfter);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // 커서가 없으면 맨 끝에 삽입
        const spaceBefore = document.createTextNode(' ');
        const spaceAfter = document.createTextNode(' ');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mediaHtml;
        const mediaElement = tempDiv.firstChild;
        
        contentEditableRef.current.appendChild(spaceBefore);
        contentEditableRef.current.appendChild(mediaElement);
        contentEditableRef.current.appendChild(spaceAfter);
        
        // 커서를 미디어 뒤로 이동
        const newRange = document.createRange();
        newRange.setStartAfter(spaceAfter);
        newRange.collapse(true);
        const newSelection = window.getSelection();
        newSelection.removeAllRanges();
        newSelection.addRange(newRange);
      }
      
      // contentEditable에 포커스 유지
      contentEditableRef.current.focus();
      
      // formData 업데이트 (innerHTML 사용)
      const content = contentEditableRef.current.innerHTML;
      setFormData(prev => ({
        ...prev,
        content: contentEditableRef.current.innerText // 텍스트만 저장
      }));
    }
  };

  // 비디오 썸네일 생성 함수
  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // 비디오의 중간 지점(또는 원하는 시간)에서 썸네일 생성
        video.currentTime = Math.min(1, video.duration / 2); // 중간 지점 또는 1초
      };
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          
          // 썸네일 크기 제한 (200x150에 맞춤)
          const maxWidth = 200;
          const maxHeight = 150;
          let width = video.videoWidth;
          let height = video.videoHeight;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(video, 0, 0, width, height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        reject(new Error('비디오 로드 실패'));
      };
      
      video.src = videoUrl;
    });
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 소환사 선택 핸들러
  const handleSummonerSelect = async ({ gameName, tagLine, fullName, suggestion }) => {
    setSelectedSummoner({ gameName, tagLine, fullName });
    setMatchList([]);
    setLoadingMatches(true);
    
    try {
      const matches = await fetchRecentMatches(gameName, tagLine, 10);
      setMatchList(matches || []);
    } catch (error) {
      console.error('매치 조회 실패:', error);
      setMatchList([]);
      alert('전적 조회에 실패했습니다.');
    } finally {
      setLoadingMatches(false);
    }
  };

  // 매치 선택 핸들러
  const handleMatchSelect = (match) => {
    setFormData(prev => ({
      ...prev,
      matchData: {
        match: match,
        summoner: selectedSummoner
      }
    }));
    alert('전적이 선택되었습니다.');
  };

  // 선택한 매치 제거
  const handleMatchRemove = () => {
    setFormData(prev => ({
      ...prev,
      matchData: null
    }));
    setSelectedSummoner(null);
    setMatchList([]);
  };


  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>{isEditMode ? "글 수정" : "글 작성"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            카테고리
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ padding: 8, width: 200 }}
          >
            <option value="free">자유게시판</option>
            <option value="guide">공략</option>
            <option value="lolmuncheol">롤문철</option>
          </select>
        </div>

        {formData.category === "lolmuncheol" && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                상대 사용자 (작성자B 닉네임)
              </label>
              <input
                type="text"
                name="writerB"
                value={formData.writerB}
                onChange={handleInputChange}
                placeholder="작성자B 닉네임을 입력하세요"
                style={{ 
                  width: "100%", 
                  padding: 10, 
                  border: "1px solid #ddd",
                  borderRadius: 4 
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                전적 검색
              </label>
              <div style={{ marginBottom: 10 }}>
                <AutocompleteSearch
                  placeholder="소환사 이름을 검색하세요 (태그는 자동으로 #KR1이 추가됩니다)"
                  onSummonerSelect={handleSummonerSelect}
                />
              </div>
              
              {selectedSummoner && (
                <div style={{ marginBottom: 10, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 4 }}>
                  <strong>선택된 소환사:</strong> {selectedSummoner.fullName}
                </div>
              )}

              {loadingMatches && (
                <div style={{ padding: 10, textAlign: "center", color: "#666" }}>
                  전적 조회 중...
                </div>
              )}

              {!loadingMatches && transformedMatchList.length > 0 && (
                <div style={{ 
                  maxHeight: "300px", 
                  overflowY: "auto", 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  padding: 10
                }}>
                  <div style={{ marginBottom: 10, fontWeight: "bold" }}>
                    최근 전적 목록 (클릭하여 선택)
                  </div>
                  {transformedMatchList.map((match, index) => {
                    const isWin = match.result === "승리";
                    const bgColor = isWin ? "#e8f5e9" : "#ffebee";
                    
                    return (
                      <div
                        key={match.matchId || index}
                        onClick={() => handleMatchSelect(match)}
                        style={{
                          padding: 10,
                          marginBottom: 8,
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          cursor: "pointer",
                          backgroundColor: bgColor,
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#e3f2fd";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = bgColor;
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{match.gameType || "게임"}</strong>
                            <span style={{ marginLeft: 10, color: isWin ? "#4caf50" : "#f44336", fontWeight: "bold" }}>
                              {match.result}
                            </span>
                            <span style={{ marginLeft: 10, color: "#666" }}>{match.duration}</span>
                          </div>
                          <div>
                            {match.champion && (
                              <span style={{ marginRight: 10 }}>
                                {match.champion.name || "챔피언"}
                                {match.champion.level > 0 && ` (Lv.${match.champion.level})`}
                              </span>
                            )}
                            {match.kda && (
                              <span style={{ fontWeight: "bold" }}>
                                {match.kda.kills}/{match.kda.deaths}/{match.kda.assists}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666", marginTop: 5 }}>
                          {match.timeAgo || "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {formData.matchData && (
                <div style={{ 
                  marginTop: 10, 
                  padding: 10, 
                  backgroundColor: "#e8f5e9", 
                  borderRadius: 4,
                  border: "2px solid #4caf50"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>선택된 전적:</strong>
                      <div style={{ marginTop: 5 }}>
                        {formData.matchData.match?.gameType} - {formData.matchData.match?.result} - {formData.matchData.match?.duration}
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        소환사: {formData.matchData.summoner?.fullName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMatchRemove}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      제거
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            제목
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목을 입력하세요"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4 
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            내용
          </label>
          
          {/* 미디어 첨부 섹션 */}
          <MediaAttachment 
            onMediaInsert={handleMediaInsert}
            content={formData.content}
            setContent={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
          />
          
          <div 
            ref={contentEditableRef}
            style={{ 
              width: "100%", 
              minHeight: "300px",
              padding: 10, 
              border: "1px solid #ddd",
              borderRadius: 4,
              backgroundColor: "white",
              position: "relative",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              wordBreak: "break-word",
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              color: "#333",
              lineHeight: "1.5"
            }}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={(e) => {
              if (!isComposing) {
                // innerHTML을 사용하여 미디어 요소도 포함하여 저장
                const content = e.target.innerText;
                setFormData(prev => ({
                  ...prev,
                  content: content
                }));
                
                // 미디어 요소가 삭제되었는지 확인하고 attachedMedia 업데이트
                const mediaElements = e.target.querySelectorAll('[data-media-id]');
                const currentMediaIds = Array.from(mediaElements).map(el => el.getAttribute('data-media-id'));
                setAttachedMedia(prev => prev.filter(media => currentMediaIds.includes(String(media.id))));
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              const content = e.target.innerText;
              setFormData(prev => ({
                ...prev,
                content: content
              }));
            }}
            onKeyDown={(e) => {
              // Enter 키 처리
              if (e.key === 'Enter') {
                e.preventDefault();
                // 현재 커서 위치에 줄바꿈 삽입
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const br = document.createElement('br');
                  range.insertNode(br);
                  range.setStartAfter(br);
                  range.setEndAfter(br);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
              // Backspace 키 처리 - 미디어 요소 삭제
              if (e.key === 'Backspace' || e.key === 'Delete') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  
                  // 범위가 선택되어 있고 미디어 요소가 포함되어 있으면 삭제
                  if (!range.collapsed) {
                    const contents = range.extractContents();
                    const mediaElements = contents.querySelectorAll ? contents.querySelectorAll('[data-media-id]') : [];
                    if (mediaElements.length > 0) {
                      e.preventDefault();
                      selection.removeAllRanges();
                      return;
                    }
                  }
                  
                  // 커서가 collapsed 상태일 때
                  if (range.collapsed) {
                    // Backspace인 경우 - 앞의 요소 확인
                    if (e.key === 'Backspace') {
                      const container = range.commonAncestorContainer;
                      let mediaElement = null;
                      
                      if (container.nodeType === Node.TEXT_NODE && container.textContent.length === 0) {
                        // 빈 텍스트 노드인 경우 앞의 형제 확인
                        const prevSibling = container.previousSibling;
                        if (prevSibling && prevSibling.getAttribute && prevSibling.getAttribute('data-media-id')) {
                          mediaElement = prevSibling;
                        } else if (container.parentNode) {
                          const parent = container.parentNode;
                          if (parent.getAttribute && parent.getAttribute('data-media-id')) {
                            mediaElement = parent;
                          } else {
                            const prevSibling = parent.previousSibling;
                            if (prevSibling && prevSibling.getAttribute && prevSibling.getAttribute('data-media-id')) {
                              mediaElement = prevSibling;
                            }
                          }
                        }
                      } else if (container.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
                        // 텍스트 노드의 시작 부분
                        const prevSibling = container.previousSibling;
                        if (prevSibling && prevSibling.getAttribute && prevSibling.getAttribute('data-media-id')) {
                          mediaElement = prevSibling;
                        }
                      } else if (container.nodeType === Node.ELEMENT_NODE) {
                        // 요소 노드인 경우
                        if (container.getAttribute && container.getAttribute('data-media-id')) {
                          mediaElement = container;
                        }
                      }
                      
                      if (mediaElement) {
                        e.preventDefault();
                        const parent = mediaElement.parentNode;
                        mediaElement.remove();
                        // 커서 위치 조정
                        if (parent && parent.textContent) {
                          const textNode = document.createTextNode('');
                          parent.insertBefore(textNode, parent.firstChild);
                          range.setStart(textNode, 0);
                          range.collapse(true);
                        } else {
                          range.setStartAfter(parent);
                          range.collapse(true);
                        }
                        selection.removeAllRanges();
                        selection.addRange(range);
                        return;
                      }
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* 첨부 및 투표 버튼 */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            📎 미디어 첨부
          </button>
          {formData.category === "lolmuncheol" && (
            <button
              type="button"
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "not-allowed"
              }}
              disabled
            >
              📊 투표 필수
            </button>
          )}
        </div>

        {/* 투표 섹션 */}
        {showVoteSection && formData.category === "lolmuncheol" && (
          <VoteSection
            voteData={voteData}
            onVoteChange={handleVoteChange}
            isEditMode={true}
          />
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {isEditMode ? "수정하기" : "작성하기"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default WritePost;
