import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import boardApi from "../../data/communityApi";
import CommentSection from "./CommentSection";
import VoteSection from "./VoteSection";
import MatchHistoryItem from "../summoner/MatchHistoryItem";
import "../../styles/summoner.css";
import "../../styles/community.css";

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

  // 상대 시간 포맷 함수
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '시간 정보 없음';
    
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    
    if (diffInMs < 0) return '시간 정보 없음'; // 미래 시간인 경우
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return `${diffInDays}일 전`;
    }
  };

  useEffect(() => {
    boardApi.getPost(id).then((data) => {
      if (!data) {
        console.error('게시글 데이터가 없습니다.');
        return;
      }
      setPost(data);
      // 백엔드에서 받은 좋아요/싫어요 개수 사용
      setLike(data.like || 0);
      setDislike(data.dislike || 0);
      
      // 롤문철 카테고리이고 vote 정보가 있으면 기본 voteData 설정
      if (data.category === "lolmuncheol" && data.vote) {
        setVoteData({
          question: data.vote.question || "",
          options: data.vote.options || [],
          results: data.vote.results || { 0: 0, 1: 0 },
          endTime: data.vote.endTime || null,
          hasEndTime: data.vote.endTime ? true : false
        });
      } else {
        setVoteData(data.vote || null);
      }
    }).catch((error) => {
      console.error('게시글 로드 실패:', error);
      alert('게시글을 불러오는 데 실패했습니다: ' + error);
    });

    const voteInfo = JSON.parse(localStorage.getItem(getVoteKey()));
    if (voteInfo && voteInfo.date === new Date().toLocaleDateString()) {
      setUserVoted(voteInfo.type);
    } else {
      localStorage.removeItem(getVoteKey());
      setUserVoted(null);
    }

    // 투표 결과 및 사용자 투표 정보 로드
    // 롤문철 카테고리이면 항상 투표 결과 조회 (로그인 여부와 관계없이)
    boardApi.getPost(id).then((postData) => {
      if (!postData) {
        console.warn('게시글 데이터가 없어 투표 결과를 조회할 수 없습니다.');
        return;
      }
      if (postData && postData.category === "lolmuncheol" && postData.vote) {
        boardApi.getVoteResults(id, currentUser).then(({ voteData, userVote }) => {
          // voteData가 있으면 사용, 없으면 post.vote 기반으로 생성
          if (voteData) {
            setVoteData(voteData);
          } else if (postData.vote) {
            setVoteData({
              question: postData.vote.question || "",
              options: postData.vote.options || [],
              results: postData.vote.results || { 0: 0, 1: 0 },
              endTime: postData.vote.endTime || null,
              hasEndTime: postData.vote.endTime ? true : false
            });
          }
          setUserVoteOption(userVote);
        }).catch(error => {
          console.error('투표 결과 조회 실패:', error);
          // 에러 발생 시에도 post.vote를 기반으로 표시
          if (postData && postData.vote) {
            setVoteData({
              question: postData.vote.question || "",
              options: postData.vote.options || [],
              results: postData.vote.results || { 0: 0, 1: 0 },
              endTime: postData.vote.endTime || null,
              hasEndTime: postData.vote.endTime ? true : false
            });
          }
        });
      }
    }).catch(error => {
      console.error('게시글 재조회 실패:', error);
    });

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
    
    // URL을 하이퍼링크로 변환 (이미 HTML 태그 안에 있는 URL은 제외)
    // http://, https://, www.로 시작하는 URL 패턴
    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s<>"']*)/gi;
    
    let lastIndex = 0;
    let result = '';
    let match;
    
    while ((match = urlRegex.exec(processedContent)) !== null) {
      const url = match[0];
      const offset = match.index;
      
      // 현재 URL 앞의 텍스트 추가
      result += processedContent.substring(lastIndex, offset);
      
      // 현재 URL 앞뒤의 컨텍스트 확인
      const beforeText = processedContent.substring(Math.max(0, offset - 100), offset);
      const afterText = processedContent.substring(offset + url.length, Math.min(processedContent.length, offset + url.length + 100));
      
      // HTML 태그 속성 내부인지 확인 (href=", src=", url( 등)
      const isInHtmlAttribute = /(?:href|src|url)\s*=\s*["']/i.test(beforeText) ||
                                  /^["']/.test(afterText);
      
      // HTML 태그 내부인지 확인 (<a>, <img> 등의 태그 내부)
      const tagMatch = beforeText.match(/<[^>]*$/);
      const isInHtmlTag = tagMatch && (tagMatch[0].includes('<a') || tagMatch[0].includes('<img') || 
                       tagMatch[0].includes('<video') || tagMatch[0].includes('<iframe') ||
                       tagMatch[0].includes('<link') || tagMatch[0].includes('<script'));
      
      // 이미 링크로 변환된 URL인지 확인
      const isAlreadyLink = beforeText.includes('<a') && afterText.includes('</a>');
      
      if (isInHtmlAttribute || isInHtmlTag || isAlreadyLink) {
        // HTML 태그 내부의 URL은 그대로 추가
        result += url;
      } else {
        // URL을 링크로 변환
        let linkUrl = url;
        // www.로 시작하는 경우 http://를 추가
        if (url.startsWith('www.')) {
          linkUrl = 'http://' + url;
        }
        // 프로토콜이 없는 경우 http://를 추가 (단, 도메인 패턴인 경우)
        else if (!url.startsWith('http://') && !url.startsWith('https://') && 
                 /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(url)) {
          linkUrl = 'http://' + url;
        }
        
        // HTML 이스케이프 처리
        const escapedUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const escapedLinkUrl = linkUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        
        result += `<a href="${escapedLinkUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">${escapedUrl}</a>`;
      }
      
      lastIndex = offset + url.length;
    }
    
    // 나머지 텍스트 추가
    result += processedContent.substring(lastIndex);
    
    processedContent = result;
    
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

  // 롤문철 카테고리: 작성자A, 작성자B, 관리자만 수정 가능
  // 일반 카테고리: 작성자, 관리자만 수정 가능
  const canEdit = post.category === "lolmuncheol"
    ? (post.writer === currentUser || post.writerB === currentUser || currentUser === adminId)
    : (post.writer === currentUser || currentUser === adminId);
  
  // 롤문철에서 작성자 B가 수정할 수 있는지 확인
  const isWriterB = post.category === "lolmuncheol" && post.writerB === currentUser;

  if (post.category === "lolmuncheol") {
    return (
      <div>
        <h2>{post.title}</h2>
        <div className="post-detail-writer-meta">
      <div>
        <Link to={`/user/${encodeURIComponent(post.writer)}`}><b>{post.writer}</b></Link> vs <Link to={`/user/${encodeURIComponent(post.writerB || "작성자B")}`}><b>{post.writerB || "작성자B"}</b></Link> | {formatTimeAgo(post.createdAt)}
      </div>
          {canEdit && (
            <div className="post-detail-actions-wrapper">
              <button onClick={handleDelete} className="post-detail-delete-button">삭제</button>
              <button onClick={handleEdit} className="post-detail-edit-button">수정</button>
            </div>
          )}
        </div>
        <hr />
        {/* 롤문철 매치업 섹션 */}
        <div className="lolmuncheol-matchup-section">
          <div className="lolmuncheol-matchup-title">롤문철 매치업</div>
          {post.matchData && post.matchData.match && (() => {
            // MatchDetails를 위한 원본 데이터 병합
            const matchWithRawData = {
              ...post.matchData.match,
              // 원본 매치 데이터에서 participants와 기타 정보 가져오기
              rawParticipants: post.matchData.originalMatch?.info?.participants || 
                               post.matchData.originalMatch?.participants ||
                               [],
              participants: post.matchData.originalMatch?.info?.participants || 
                           post.matchData.originalMatch?.participants ||
                           [],
              teams: post.matchData.originalMatch?.info?.teams || 
                     post.matchData.originalMatch?.teams ||
                     post.matchData.match.teams || [],
              gameDuration: post.matchData.originalMatch?.info?.gameDuration || 
                            post.matchData.originalMatch?.gameDuration ||
                            post.matchData.match.gameDuration,
              gameCreation: post.matchData.originalMatch?.info?.gameCreation || 
                           post.matchData.originalMatch?.gameCreation ||
                           post.matchData.match.gameCreation,
              ddVer: post.matchData.match.ddVer || '15.18.1',
              id: post.matchData.matchId,
              matchId: post.matchData.matchId
            };
            return (
              <div className="lolmuncheol-matchup-container">
                <MatchHistoryItem matchData={matchWithRawData} />
              </div>
            );
          })()}
        </div>
        {/* split content area */}
        <div className="lolmuncheol-split-container">
          <div className="lolmuncheol-split-left">
            <div className="lolmuncheol-writer-name">
              <b>{post.writer}</b>
            </div>
            <div className="lolmuncheol-content-area" dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.content) }} />
          </div>
          <div className="lolmuncheol-split-right">
            <div className="lolmuncheol-writer-name">
              <b>{post.writerB || "작성자B"}</b>
            </div>
            <div className="lolmuncheol-content-area" dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.contentB || "아직 작성되지 않았습니다.") }} />
          </div>
        </div>

        {/* 추천/반대 버튼 */}
        <div className="post-detail-vote-buttons-container">
          <span 
            className="post-detail-vote-link" 
            onClick={() => handleVoteToggle("like")}
          >
            {userVoted === "like" ? `👍 추천 취소 (${like})` : `👍 추천 (${like})`}
          </span>
          <span 
            className="post-detail-vote-link" 
            onClick={() => handleVoteToggle("dislike")}
          >
            {userVoted === "dislike" ? `👎 반대 취소 (${dislike})` : `👎 반대 (${dislike})`}
          </span>
        </div>

        {/* 투표 섹션 - 본문과 댓글 사이 */}
        {/* 롤문철 카테고리이고 vote 정보가 있으면 항상 표시 */}
        {post && post.category === "lolmuncheol" && post.vote && (
          <VoteDisplay 
            voteData={voteData || post.vote} 
            userVoteOption={userVoteOption}
            onVoteSubmit={handleVoteSubmit}
            onVoteCancel={handleVoteCancel}
            currentUser={currentUser}
          />
        )}

        <CommentSection postId={post.id} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <div className="post-detail-writer-meta">
        <div>
          <Link to={`/user/${encodeURIComponent(post.writer)}`}><b>{post.writer}</b></Link> | {formatTimeAgo(post.createdAt)}
        </div>
        {canEdit && (
          <div className="post-detail-actions-wrapper">
            <button
              onClick={handleDelete}
              className="post-detail-delete-button"
            >
              삭제
            </button>
            <button onClick={handleEdit} className="post-detail-edit-button">
              수정
            </button>
          </div>
        )}
      </div>
      <hr />
      <div className="post-detail-content-wrapper" dangerouslySetInnerHTML={{ __html: renderContentWithMedia(post.content) }} />
      
      {/* 투표 섹션 */}
      {/* 롤문철 카테고리이고 vote 정보가 있으면 항상 표시 */}
      {post && post.category === "lolmuncheol" && post.vote && (
        <VoteDisplay 
          voteData={voteData || post.vote} 
          userVoteOption={userVoteOption}
          onVoteSubmit={handleVoteSubmit}
          onVoteCancel={handleVoteCancel}
          currentUser={currentUser}
        />
      )}
      
      <div className="post-detail-vote-buttons-container">
        <span 
          className="post-detail-vote-link" 
          onClick={() => handleVoteToggle("like")}
        >
          {userVoted === "like" ? `👍 추천 취소 (${like})` : `👍 추천 (${like})`}
        </span>
        <span 
          className="post-detail-vote-link" 
          onClick={() => handleVoteToggle("dislike")}
        >
          {userVoted === "dislike" ? `👎 반대 취소 (${dislike})` : `👎 반대 (${dislike})`}
        </span>
      </div>
      <CommentSection postId={post.id} currentUser={currentUser} />
    </div>
  );
}

  // 투표 표시 컴포넌트
function VoteDisplay({ voteData, userVoteOption, onVoteSubmit, onVoteCancel, currentUser }) {
  const [selectedOption, setSelectedOption] = useState(userVoteOption);
  const [hasVoted, setHasVoted] = useState(userVoteOption !== null);
  const [isExpired, setIsExpired] = useState(false);
  const [endTimeText, setEndTimeText] = useState(null);
  const [remainingTimeText, setRemainingTimeText] = useState(null);

  // userVoteOption이 변경될 때 상태 업데이트
  useEffect(() => {
    setSelectedOption(userVoteOption);
    setHasVoted(userVoteOption !== null);
  }, [userVoteOption]);

  // voteData의 endTime이 변경될 때 종료 시간 텍스트 업데이트
  useEffect(() => {
    if (!voteData) {
      setEndTimeText(null);
      return;
    }

    const hasEndTime = voteData.hasEndTime || (voteData.endTime != null && voteData.endTime !== '');
    if (hasEndTime && voteData.endTime) {
      try {
        const date = new Date(voteData.endTime);
        if (isNaN(date.getTime())) {
          console.warn('유효하지 않은 종료 시간:', voteData.endTime);
          setEndTimeText(null);
          return;
        }
        // 월, 일, 시간, 분 형식으로 포맷팅 (예: 12월 31일 23:59)
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const formatted = `${month}월 ${day}일 ${hours}:${minutes}`;
        setEndTimeText(formatted);
      } catch (error) {
        console.error('종료 시간 파싱 오류:', error);
        setEndTimeText(null);
      }
    } else {
      setEndTimeText(null);
    }
  }, [voteData]);

  // 투표 종료 시간 체크 및 남은 시간 계산
  useEffect(() => {
    // endTime이 있으면 hasEndTime도 true로 간주
    const hasEndTime = voteData?.hasEndTime || (voteData?.endTime != null && voteData?.endTime !== '');
    
    if (!voteData || !hasEndTime || !voteData.endTime) {
      setIsExpired(false);
      setRemainingTimeText(null);
      return;
    }

    // 초기 체크 및 남은 시간 계산
    const checkExpiredAndRemaining = () => {
      try {
        const now = new Date();
        let endTime = new Date(voteData.endTime);
        
        // endTime이 유효하지 않은 경우 처리
        if (isNaN(endTime.getTime())) {
          console.warn('유효하지 않은 종료 시간:', voteData.endTime);
          setIsExpired(false);
          setRemainingTimeText(null);
          return;
        }
        
        const expired = now.getTime() > endTime.getTime();
        
        // 상태 업데이트 (이전 값과 다를 때만 로그 출력)
        setIsExpired(prev => {
          if (prev !== expired) {
            console.log('투표 종료 상태 변경:', {
              이전: prev,
              현재: expired,
              현재시간: now.toISOString(),
              종료시간: endTime.toISOString()
            });
          }
          return expired;
        });

        // 남은 시간 계산 (아직 종료되지 않았을 때만)
        if (!expired) {
          const diffInMs = endTime.getTime() - now.getTime();
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          const remainingHours = diffInHours % 24;
          const remainingMinutes = diffInMinutes % 60;

          let remainingText = '';
          if (diffInDays > 0) {
            remainingText = `${diffInDays}일`;
            if (remainingHours > 0) {
              remainingText += ` ${remainingHours}시간`;
            }
            if (remainingMinutes > 0 && diffInDays === 0) {
              remainingText += ` ${remainingMinutes}분`;
            }
          } else if (diffInHours > 0) {
            remainingText = `${diffInHours}시간`;
            if (remainingMinutes > 0) {
              remainingText += ` ${remainingMinutes}분`;
            }
          } else if (diffInMinutes > 0) {
            remainingText = `${diffInMinutes}분`;
          } else {
            remainingText = '곧 종료';
          }
          
          setRemainingTimeText(remainingText);
        } else {
          setRemainingTimeText(null);
        }
      } catch (error) {
        console.error('종료 시간 체크 중 오류:', error);
        setIsExpired(false);
        setRemainingTimeText(null);
      }
    };

    checkExpiredAndRemaining();

    // 1초마다 체크 (종료 시간이 있을 때만)
    const interval = setInterval(checkExpiredAndRemaining, 1000);

    return () => clearInterval(interval);
  }, [voteData]);

  // voteData가 없으면 기본값 설정
  if (!voteData || !voteData.question || !voteData.options) {
    return null; // 필수 데이터가 없으면 렌더링하지 않음
  }

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
    // results가 객체인지 확인하고 안전하게 처리
    const results = voteData.results || {};
    return Object.values(results).reduce((sum, count) => {
      const num = typeof count === 'number' ? count : parseInt(count) || 0;
      return sum + num;
    }, 0);
  };

  const getVotePercentage = (optionIndex) => {
    if (!voteData.results) return 0;
    const results = voteData.results || {};
    // 숫자 키와 문자열 키 모두 처리
    const voteCount = results[optionIndex] || results[String(optionIndex)] || 0;
    const total = getTotalVotes();
    if (total === 0) return 0;
    const count = typeof voteCount === 'number' ? voteCount : parseInt(voteCount) || 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="vote-display-container">
      <h3 className="vote-display-title">📊 투표</h3>
      
      <div className="vote-display-question-section">
        <div className="vote-display-question-header">
          <span className="vote-display-question-text">{voteData.question}</span>
          {endTimeText && (
            <div className="vote-display-time-info">
              <span className={`vote-display-end-time-text ${isExpired ? 'expired' : ''}`}>
                종료: {endTimeText}
              </span>
              {remainingTimeText && !isExpired && (
                <span className="vote-display-remaining-time-text">
                  남은 시간: {remainingTimeText}
                </span>
              )}
            </div>
          )}
        </div>
        
        {isExpired && (
          <p className="vote-display-expired-message">
            ⏰ 투표가 종료되었습니다.
          </p>
        )}
      </div>

      {!hasVoted && !isExpired ? (
        <div className="vote-display-options-wrapper">
          <div className="vote-display-options-list">
            {voteData.options.map((option, index) => (
              <div key={index} className="vote-display-option-item">
                <label className="vote-display-option-label">
                  <input
                    type="radio"
                    name="voteOption"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="vote-display-option-radio"
                  />
                  <span className="vote-display-option-text">{option}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={handleVote}
            className="vote-display-submit-btn"
          >
            투표하기
          </button>
        </div>
      ) : (
        <div className="vote-display-results-list">
          {voteData.options.map((option, index) => {
            // results가 없어도 0으로 표시
            const results = voteData.results || {};
            const voteCount = results[index] || results[String(index)] || 0;
            const count = typeof voteCount === 'number' ? voteCount : parseInt(voteCount) || 0;
            const percentage = getVotePercentage(index);
            const isUserVote = userVoteOption === index;
            
            return (
              <div key={index} className={`vote-display-result-item ${isUserVote ? 'user-vote' : ''}`}>
                <div className="vote-display-result-header">
                  <span className={`vote-display-result-option ${isUserVote ? 'user-vote' : ''}`}>
                    {option} {isUserVote && "✓"}
                  </span>
                  <span className="vote-display-result-count">{count}표 ({percentage}%)</span>
                </div>
                <div className="vote-display-progress-bar">
                  <div className={`vote-display-progress-fill ${isUserVote ? 'user-vote' : ''}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
          <p className="vote-display-total-text">
            총 {getTotalVotes()}표
          </p>
        </div>
      )}

      {hasVoted && !isExpired && (
        <div className="vote-display-actions">
          <p className="vote-display-complete-message">
            ✓ 투표가 완료되었습니다.
          </p>
          <button
            onClick={handleVoteCancel}
            className="vote-display-cancel-btn"
          >
            투표 취소
          </button>
        </div>
      )}

      {hasVoted && isExpired && (
        <div className="vote-display-expired-container">
          <p className="vote-display-complete-message">
            ✓ 투표가 완료되었습니다. (투표가 종료되어 결과를 확인할 수 있습니다)
          </p>
        </div>
      )}

      {!hasVoted && isExpired && (
        <div className="vote-display-expired-container">
          <p className="vote-display-expired-info">
            투표가 종료되었습니다. 위의 결과를 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}

// 정적 투표 컴포넌트 (모습만 표시)
function VoteDisplayStatic() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOption === null) {
      alert("진영을 선택해주세요.");
      return;
    }
    setHasVoted(true);
    alert("투표가 완료되었습니다.");
  };

  const voteResults = {
    0: { votes: 15, percentage: 75 },
    1: { votes: 5, percentage: 25 }
  };

  const totalVotes = 20;

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: 8, 
      padding: 20, 
      marginBottom: 20,
      marginTop: 20,
      backgroundColor: "#f9f9f9"
    }}>
      <h3 style={{ marginBottom: 15, color: "#333" }}>📊 투표</h3>
      
      <div style={{ marginBottom: 15 }}>
        <h4 style={{ marginBottom: 10 }}>누가 이길까요?</h4>
        <p style={{ color: "#666", fontSize: "0.9em", marginBottom: 15 }}>
          종료 시간: 2024-12-31 23:59
        </p>
      </div>

      {!hasVoted ? (
        <>
          {/* 투표 선택 창 */}
          <div style={{ marginBottom: 15 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px", border: "1px solid #ddd", borderRadius: 4, backgroundColor: "#fff" }}>
                <input
                  type="radio"
                  name="voteOption"
                  value="0"
                  checked={selectedOption === 0}
                  onChange={() => setSelectedOption(0)}
                  style={{ marginRight: 10 }}
                />
                <span>사용자A</span>
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px", border: "1px solid #ddd", borderRadius: 4, backgroundColor: "#fff" }}>
                <input
                  type="radio"
                  name="voteOption"
                  value="1"
                  checked={selectedOption === 1}
                  onChange={() => setSelectedOption(1)}
                  style={{ marginRight: 10 }}
                />
                <span>사용자B</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleVote}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            투표 완료
          </button>
        </>
      ) : (
        <>
          {/* 투표 결과 표시 */}
          <div style={{ marginBottom: 15 }}>
            <div style={{ 
              marginBottom: 10, 
              padding: 10, 
              border: selectedOption === 0 ? "2px solid #007bff" : "1px solid #ddd",
              borderRadius: 4,
              backgroundColor: selectedOption === 0 ? "#e3f2fd" : "#fff"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontWeight: selectedOption === 0 ? "bold" : "normal" }}>
                  사용자A {selectedOption === 0 && "✓"}
                </span>
                <span style={{ flexShrink: 0, marginLeft: 10 }}>{voteResults[0].votes}표 ({voteResults[0].percentage}%)</span>
              </div>
              <div style={{ 
                width: "100%", 
                height: 8, 
                backgroundColor: "#e0e0e0", 
                borderRadius: 4,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${voteResults[0].percentage}%`,
                  height: "100%",
                  backgroundColor: selectedOption === 0 ? "#007bff" : "#28a745",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>

            <div style={{ 
              marginBottom: 10, 
              padding: 10, 
              border: selectedOption === 1 ? "2px solid #007bff" : "1px solid #ddd",
              borderRadius: 4,
              backgroundColor: selectedOption === 1 ? "#e3f2fd" : "#fff"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontWeight: selectedOption === 1 ? "bold" : "normal" }}>
                  사용자B {selectedOption === 1 && "✓"}
                </span>
                <span style={{ flexShrink: 0, marginLeft: 10 }}>{voteResults[1].votes}표 ({voteResults[1].percentage}%)</span>
              </div>
              <div style={{ 
                width: "100%", 
                height: 8, 
                backgroundColor: "#e0e0e0", 
                borderRadius: 4,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${voteResults[1].percentage}%`,
                  height: "100%",
                  backgroundColor: selectedOption === 1 ? "#007bff" : "#28a745",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
            
            <p style={{ color: "#666", fontSize: "0.9em", marginTop: 10 }}>
              총 {totalVotes}표
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <p style={{ color: "#28a745", fontWeight: "bold", margin: 0 }}>
              ✓ 투표가 완료되었습니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default PostDetailPage;


