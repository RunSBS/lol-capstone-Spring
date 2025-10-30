import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import boardApi from "../../data/communityApi";
import CommentSection from "./CommentSection";
import VoteSection from "./VoteSection";

function PostDetailPage({ currentUser, adminId, postId }) {
  const id = postId || useParams().id;
  const [post, setPost] = useState(null);
  const [like, setLike] = useState(0);
  const [dislike, setDislike] = useState(0);
  const [userVoted, setUserVoted] = useState(null);
  const [voteData, setVoteData] = useState(null);
  const [userVoteOption, setUserVoteOption] = useState(null);
  const navigate = useNavigate();

  const getVoteKey = () => `post-vote-${id}-${currentUser || "guest"}`;
  const getCheerKey = () => `lolmuncheol-cheer-${id}-${currentUser || "guest"}`;

  useEffect(() => {
    boardApi.getPost(id).then((data) => {
      setPost(data);
      // 백엔드에서 받은 좋아요/싫어요 개수 사용
      setLike(data.like || 0);
      setDislike(data.dislike || 0);
      setVoteData(data.vote || null);
    });

    const voteInfo = JSON.parse(localStorage.getItem(getVoteKey()));
    if (voteInfo && voteInfo.date === new Date().toLocaleDateString()) {
      setUserVoted(voteInfo.type);
    } else {
      localStorage.removeItem(getVoteKey());
      setUserVoted(null);
    }

    // 투표 결과 및 사용자 투표 정보 로드
    if (currentUser) {
      boardApi.getVoteResults(id, currentUser).then(({ voteData, userVote }) => {
        setVoteData(voteData);
        setUserVoteOption(userVote);
      });
    }

    // no state here for cheer; handled inline
  }, [id, currentUser]);

  const handleVoteToggle = (type) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (userVoted === type) {
      if (type === "like") {
        boardApi.removeLikePost(post.id).then(() => {
          setLike((prev) => Math.max(prev - 1, 0));
          setUserVoted(null);
          localStorage.removeItem(getVoteKey());
        });
      } else {
        boardApi.removeDislikePost(post.id).then(() => {
          setDislike((prev) => Math.max(prev - 1, 0));
          setUserVoted(null);
          localStorage.removeItem(getVoteKey());
        });
      }
    } else {
      if (userVoted) {
        alert("추천과 반대는 동시에 할 수 없습니다.");
        return;
      }
      if (type === "like") {
        boardApi.likePost(post.id).then(() => {
          setLike((prev) => prev + 1);
          setUserVoted("like");
          localStorage.setItem(
            getVoteKey(),
            JSON.stringify({ type: "like", date: new Date().toLocaleDateString() })
          );
        });
      } else if (type === "dislike") {
        boardApi.dislikePost(post.id).then(() => {
          setDislike((prev) => prev + 1);
          setUserVoted("dislike");
          localStorage.setItem(
            getVoteKey(),
            JSON.stringify({ type: "dislike", date: new Date().toLocaleDateString() })
          );
        });
      }
    }
  };

  const handleDelete = () => {
    if (!post) return;
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    // lolmuncheol: only admin can delete
    if (post.category === "lolmuncheol") {
      if (currentUser !== adminId) {
        alert("롤문철 글은 관리자만 삭제할 수 있습니다.");
        return;
      }
    } else {
      if (post.writer !== currentUser && currentUser !== adminId) {
        alert("삭제는 작성자 또는 관리자만 가능합니다.");
        return;
      }
    }
    if (window.confirm("정말 삭제하시겠습니까?")) {
      boardApi
        .deletePost(post.id, currentUser)
        .then(() => {
          alert("삭제되었습니다.");
          navigate(`/community/${post.category}`);
        })
        .catch((err) => alert(err));
    }
  };

  // 수정 버튼 클릭 시 WritePost로 현재 글 전달하며 이동
  const handleEdit = () => {
    navigate("/community/write", { state: { postToEdit: post } });
  };

  // 투표 참여 핸들러
  const handleVoteSubmit = async (optionIndex) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await boardApi.voteOnPost(id, optionIndex, currentUser);
      
      // 롤문철 카테고리인 경우 투표 시 자동으로 추천
      if (post && post.category === "lolmuncheol") {
        try {
          await boardApi.likePost(post.id);
          setLike(prev => prev + 1);
          setUserVoted("like");
          localStorage.setItem(
            getVoteKey(),
            JSON.stringify({ type: "like", date: new Date().toLocaleDateString() })
          );
        } catch (likeError) {
          console.log("자동 추천 실패:", likeError);
        }
      }
      
      alert("투표가 완료되었습니다.");
      
      // 투표 결과 다시 로드
      const { voteData, userVote } = await boardApi.getVoteResults(id, currentUser);
      setVoteData(voteData);
      setUserVoteOption(userVote);
    } catch (error) {
      alert("투표 중 오류가 발생했습니다: " + error);
    }
  };

  // 투표 취소 핸들러
  const handleVoteCancel = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await boardApi.removeVoteFromPost(id, currentUser);
      
      // 롤문철 카테고리인 경우 투표 취소 시 자동으로 추천도 취소
      if (post && post.category === "lolmuncheol") {
        try {
          await boardApi.removeLikePost(post.id);
          setLike(prev => Math.max(prev - 1, 0));
          setUserVoted(null);
          localStorage.removeItem(getVoteKey());
        } catch (likeError) {
          console.log("자동 추천 취소 실패:", likeError);
        }
      }
      
      alert("투표가 취소되었습니다.");
      
      // 투표 결과 다시 로드
      const { voteData, userVote } = await boardApi.getVoteResults(id, currentUser);
      setVoteData(voteData);
      setUserVoteOption(userVote);
    } catch (error) {
      alert("투표 취소 중 오류가 발생했습니다: " + error);
    }
  };

  // 미디어 태그를 실제 미디어로 변환하는 함수
  const renderContentWithMedia = (content) => {
    if (!content) return '';
    
    // [MEDIA:id] 태그를 찾아서 실제 미디어로 변환
    const mediaTagRegex = /\[MEDIA:([^\]]+)\]/g;
    let processedContent = content;
    
    // 미디어 태그를 실제 미디어로 변환
    processedContent = processedContent.replace(mediaTagRegex, (match, mediaId) => {
      console.log('미디어 ID:', mediaId);
      const mediaData = getMediaDataById(mediaId);
      console.log('찾은 미디어 데이터:', mediaData);
      
      if (mediaData && mediaData.url) {
        if (mediaData.type === 'image') {
          return `<div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
            <img src="${mediaData.url}" alt="${mediaData.name}" style="max-width: 100%; max-height: 300px; border-radius: 4px; display: block; margin: 0 auto;" />
            <div style="font-size: 12px; color: #666; margin-top: 8px; text-align: center;">${mediaData.name}</div>
          </div>`;
        } else if (mediaData.type === 'video') {
          return `<div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
            <video src="${mediaData.url}" controls style="max-width: 100%; max-height: 300px; border-radius: 4px; display: block; margin: 0 auto;" />
            <div style="font-size: 12px; color: #666; margin-top: 8px; text-align: center;">${mediaData.name}</div>
          </div>`;
        }
      }
      
      // 미디어 데이터를 찾을 수 없는 경우
      console.log('미디어 데이터를 찾을 수 없음:', mediaId);
      return `<div style="margin: 15px 0; padding: 20px; background: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 8px; text-align: center; color: #6c757d;">
        <div style="font-size: 24px; margin-bottom: 8px;">📎</div>
        <div>첨부된 미디어</div>
        <div style="font-size: 12px; margin-top: 4px;">ID: ${mediaId}</div>
        <div style="font-size: 10px; margin-top: 2px; color: #999;">데이터를 찾을 수 없습니다</div>
      </div>`;
    });
    
    return processedContent;
  };

  // 미디어 데이터를 ID로 찾는 함수 (실제 구현에서는 서버 API 사용)
  const getMediaDataById = (mediaId) => {
    // 로컬 스토리지에서 미디어 데이터를 찾는 로직
    try {
      const storedMedia = localStorage.getItem(`media_${mediaId}`);
      if (storedMedia) {
        return JSON.parse(storedMedia);
      }
      
      // 모든 미디어 키를 검색해서 찾기
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('media_')) {
          const mediaData = JSON.parse(localStorage.getItem(key));
          if (mediaData && mediaData.id === mediaId) {
            return mediaData;
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  if (!post) return <div>로딩중...</div>;

  // lolmuncheol: writerA or writerB can edit; others only admin
  const canEdit = post.category === "lolmuncheol"
    ? (post.writer === currentUser || post.writerB === currentUser || currentUser === adminId)
    : (post.writer === currentUser || currentUser === adminId);

  if (post.category === "lolmuncheol") {
    return (
      <div>
        <h2>{post.title}</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <Link to={`/user/${encodeURIComponent(post.writer)}`}><b>{post.writer}</b></Link> vs <Link to={`/user/${encodeURIComponent(post.writerB || "작성자B")}`}><b>{post.writerB || "작성자B"}</b></Link> | {new Date(post.createdAt).toLocaleString()}
      </div>
          {canEdit && (
            <div>
              <button onClick={handleDelete} style={{ margin: "10px 10px 10px 0", backgroundColor: "red", color: "white" }}>삭제</button>
              <button onClick={handleEdit} style={{ marginBottom: 10 }}>수정</button>
            </div>
          )}
        </div>
        <hr />
        {/* top rectangle area */}
        <div style={{ height: 80, border: "1px solid #eee", marginBottom: 12, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
          롤문철 매치업
        </div>
        {/* split content area */}
        <div style={{ 
          display: "flex", 
          minHeight: "400px", // 최소 높이 설정으로 이등분 선 고정
          border: "1px solid #ddd",
          borderRadius: 6
        }}>
          <div style={{ 
            flex: 1, 
            borderRight: "1px solid #ddd", 
            padding: 16,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ marginBottom: 12, fontSize: "1.1em", fontWeight: "bold" }}>
              <b>{post.writer}</b>
            </div>
            <div style={{ 
              flex: 1,
              whiteSpace: "pre-wrap", 
              overflow: "auto",
              minHeight: "300px",
              wordWrap: "break-word",
              wordBreak: "break-word",
              maxWidth: "100%"
            }} dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.content) }} />
          </div>
          <div style={{ 
            flex: 1, 
            padding: 16,
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ marginBottom: 12, fontSize: "1.1em", fontWeight: "bold" }}>
              <b>{post.writerB || "작성자B"}</b>
            </div>
            <div style={{ 
              flex: 1,
              whiteSpace: "pre-wrap", 
              overflow: "auto",
              minHeight: "300px",
              wordWrap: "break-word",
              wordBreak: "break-word",
              maxWidth: "100%"
            }} dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.contentB || "아직 작성되지 않았습니다.") }} />
          </div>
        </div>

        {/* 투표 섹션 */}
        {voteData && (
          <VoteDisplay 
            voteData={voteData} 
            userVoteOption={userVoteOption}
            onVoteSubmit={handleVoteSubmit}
            onVoteCancel={handleVoteCancel}
            currentUser={currentUser}
          />
        )}

        {/* 추천/반대 버튼 */}
        <div style={{ margin: "24px 0", textAlign: "center" }}>
          <button onClick={() => handleVoteToggle("like")}>
            {userVoted === "like" ? "👍 추천 취소" : "👍 추천"}
          </button>
          <span style={{ margin: "0 16px" }}>추천: {like}</span>
          <button onClick={() => handleVoteToggle("dislike")}>
            {userVoted === "dislike" ? "👎 반대 취소" : "👎 반대"}
          </button>
          <span style={{ margin: "0 16px" }}>반대: {dislike}</span>
        </div>
        
        <CommentSection postId={post.id} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <div>
        <Link to={`/user/${encodeURIComponent(post.writer)}`}><b>{post.writer}</b></Link> | {new Date(post.createdAt).toLocaleString()}
      </div>
      {canEdit && (
        <>
          <button
            onClick={handleDelete}
            style={{ margin: "10px 10px 10px 0", backgroundColor: "red", color: "white" }}
          >
            삭제
          </button>
          <button onClick={handleEdit} style={{ marginBottom: 10 }}>
            수정
          </button>
        </>
      )}
      <hr />
      <div style={{ 
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        wordBreak: "break-word",
        maxWidth: "100%",
        overflow: "hidden"
      }} dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.content) }} />
      
      {/* 투표 섹션 */}
      {voteData && (
        <VoteDisplay 
          voteData={voteData} 
          userVoteOption={userVoteOption}
          onVoteSubmit={handleVoteSubmit}
          onVoteCancel={handleVoteCancel}
          currentUser={currentUser}
        />
      )}
      
      <div style={{ margin: "24px 0", textAlign: "center" }}>
        <button onClick={() => handleVoteToggle("like")}>
          {userVoted === "like" ? "👍 추천 취소" : "👍 추천"}
        </button>
        <span style={{ margin: "0 16px" }}>추천: {like}</span>
        <button onClick={() => handleVoteToggle("dislike")}>
          {userVoted === "dislike" ? "👎 반대 취소" : "👎 반대"}
        </button>
        <span style={{ margin: "0 16px" }}>반대: {dislike}</span>
      </div>
      <CommentSection postId={post.id} currentUser={currentUser} />
    </div>
  );
}

// 투표 표시 컴포넌트
function VoteDisplay({ voteData, userVoteOption, onVoteSubmit, onVoteCancel, currentUser }) {
  const [selectedOption, setSelectedOption] = useState(userVoteOption);
  const [hasVoted, setHasVoted] = useState(userVoteOption !== null);

  const isExpired = voteData.hasEndTime && voteData.endTime && new Date() > new Date(voteData.endTime);
  const endTimeText = voteData.hasEndTime && voteData.endTime 
    ? new Date(voteData.endTime).toLocaleString() 
    : null;

  const handleVote = async () => {
    if (selectedOption === null) {
      alert("투표 옵션을 선택해주세요.");
      return;
    }
    
    await onVoteSubmit(selectedOption);
    setHasVoted(true);
  };

  const handleVoteCancel = async () => {
    await onVoteCancel();
    setHasVoted(false);
    setSelectedOption(null);
  };

  const getTotalVotes = () => {
    if (!voteData.results) return 0;
    return Object.values(voteData.results).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (optionIndex) => {
    if (!voteData.results || !voteData.results[optionIndex]) return 0;
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((voteData.results[optionIndex] / total) * 100);
  };

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: 8, 
      padding: 20, 
      marginBottom: 20,
      backgroundColor: "#f9f9f9"
    }}>
      <h3 style={{ marginBottom: 15, color: "#333" }}>📊 투표</h3>
      
      <div style={{ marginBottom: 15 }}>
        <h4 style={{ marginBottom: 10 }}>{voteData.question}</h4>
        {voteData.description && (
          <p style={{ color: "#666", marginBottom: 15 }}>{voteData.description}</p>
        )}
        
        {endTimeText && (
          <p style={{ color: "#666", fontSize: "0.9em", marginBottom: 15 }}>
            종료 시간: {endTimeText}
          </p>
        )}
        
        {isExpired && (
          <p style={{ color: "#dc3545", fontWeight: "bold", marginBottom: 15 }}>
            ⏰ 투표가 종료되었습니다.
          </p>
        )}
      </div>

      {!hasVoted && !isExpired ? (
        <div style={{ marginBottom: 15 }}>
          {voteData.options.map((option, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="voteOption"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  style={{ marginRight: 10 }}
                />
                <span style={{ 
                  wordWrap: "break-word", 
                  wordBreak: "break-word", 
                  maxWidth: "100%" 
                }}>{option}</span>
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 15 }}>
          {voteData.options.map((option, index) => {
            const voteCount = voteData.results?.[index] || 0;
            const percentage = getVotePercentage(index);
            const isUserVote = userVoteOption === index;
            
            return (
              <div key={index} style={{ 
                marginBottom: 10, 
                padding: 10, 
                border: isUserVote ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: isUserVote ? "#e3f2fd" : "#fff"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ 
                    fontWeight: isUserVote ? "bold" : "normal",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                    maxWidth: "70%"
                  }}>
                    {option} {isUserVote && "✓"}
                  </span>
                  <span style={{ 
                    flexShrink: 0,
                    marginLeft: 10
                  }}>{voteCount}표 ({percentage}%)</span>
                </div>
                <div style={{ 
                  width: "100%", 
                  height: 8, 
                  backgroundColor: "#e0e0e0", 
                  borderRadius: 4,
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: isUserVote ? "#007bff" : "#28a745",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
            );
          })}
          <p style={{ color: "#666", fontSize: "0.9em", marginTop: 10 }}>
            총 {getTotalVotes()}표
          </p>
        </div>
      )}

      {!hasVoted && !isExpired && (
        <button
          onClick={handleVote}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          투표하기
        </button>
      )}

      {hasVoted && !isExpired && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <p style={{ color: "#28a745", fontWeight: "bold", margin: 0 }}>
            ✓ 투표가 완료되었습니다.
          </p>
          <button
            onClick={handleVoteCancel}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "0.9em"
            }}
          >
            투표 취소
          </button>
        </div>
      )}

      {hasVoted && isExpired && (
        <p style={{ color: "#28a745", fontWeight: "bold" }}>
          ✓ 투표가 완료되었습니다.
        </p>
      )}
    </div>
  );
}

export default PostDetailPage;


