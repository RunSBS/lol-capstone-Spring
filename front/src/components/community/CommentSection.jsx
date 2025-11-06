import React, { useEffect, useState } from "react";
import commentApi from "../../data/commentApi";
import { Link } from "react-router-dom";
import "../../styles/community.css";

const ADMIN_ID = "admin1"; // 관리자 아이디

function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [userVotes, setUserVotes] = useState({}); // 댓글별 사용자 투표 상태

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

  const fetchComments = () => {
    commentApi.getCommentsByPostId(postId).then(setComments);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 사용자 투표 상태는 백엔드에서 관리하지 않으므로 초기화
  // (백엔드에 사용자별 투표 기록 테이블이 없음)
  useEffect(() => {
    setUserVotes({});
  }, [comments, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    await commentApi.createComment({
      postId,
      writer: currentUser,
      text,
      like: 0,
      dislike: 0,
    });
    setText("");
    fetchComments();
  };

  const handleDelete = async (id, writer) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (writer !== currentUser && currentUser !== ADMIN_ID) {
      alert("본인의 댓글만 삭제할 수 있습니다.");
      return;
    }
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await commentApi.deleteComment(id);
        fetchComments();
      } catch (error) {
        alert("댓글 삭제 중 오류가 발생했습니다: " + (error.message || error));
      }
    }
  };

  const startEdit = (id, currentText) => {
    setEditingCommentId(id);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }
    try {
      await commentApi.updateComment(id, { text: editText });
      cancelEdit();
      fetchComments();
    } catch (error) {
      alert("댓글 수정 중 오류가 발생했습니다: " + (error.message || error));
    }
  };

  const handleVoteToggle = async (commentId, type) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const currentVote = userVotes[commentId];

    try {
      if (currentVote === type) {
        // 같은 버튼을 다시 누른 경우 - 취소
        if (type === 'like') {
          await commentApi.removeLikeComment(commentId, currentUser);
        } else {
          await commentApi.removeDislikeComment(commentId, currentUser);
        }
        setUserVotes(prev => ({ ...prev, [commentId]: null }));
      } else {
        // 다른 버튼을 누른 경우 - 백엔드에서 자동으로 처리 (기존 취소 후 새로 투표)
        if (type === 'like') {
          await commentApi.likeComment(commentId, currentUser);
        } else {
          await commentApi.dislikeComment(commentId, currentUser);
        }
        
        setUserVotes(prev => ({ ...prev, [commentId]: type }));
      }
      
      // 백엔드에서 최신 댓글 정보 조회하여 상태 업데이트
      fetchComments();
    } catch (error) {
      // 백엔드에서 중복 투표 에러 발생 시 처리
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes("이미 추천한") || errorMessage.includes("이미 반대한")) {
        alert("이미 투표한 댓글입니다.");
      } else {
        alert("투표 중 오류가 발생했습니다: " + errorMessage);
      }
      // 댓글 정보 다시 불러오기
      fetchComments();
    }
  };

  return (
    <div className="comment-section">
      <h4>댓글</h4>
      {comments.map((c) => (
        <div key={c.id} className="comment-item">
          <div className="comment-header">
            <div className="comment-author">
              <a href={`/user/${encodeURIComponent(c.writer)}`} target="_blank" rel="noopener noreferrer"><b>{c.writer}</b></a> | <span className="comment-meta">{formatTimeAgo(c.createdAt)}</span>
            </div>
            <div className="comment-actions">
              <span 
                className="comment-vote-link" 
                onClick={() => handleVoteToggle(c.id, 'like')}
              >
                {userVotes[c.id] === 'like' ? `👍 추천 취소 (${c.like || 0})` : `👍 추천 (${c.like || 0})`}
              </span>
              <span 
                className="comment-vote-link" 
                onClick={() => handleVoteToggle(c.id, 'dislike')}
              >
                {userVotes[c.id] === 'dislike' ? `👎 반대 취소 (${c.dislike || 0})` : `👎 반대 (${c.dislike || 0})`}
              </span>
            </div>
          </div>
          {editingCommentId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="comment-edit-textarea"
              />
              <div className="comment-edit-actions">
                <span 
                  className="comment-action-link" 
                  onClick={() => saveEdit(c.id)}
                >
                  저장
                </span>
                <span 
                  className="comment-action-link" 
                  onClick={cancelEdit}
                >
                  취소
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="comment-content">{c.text}</div>
              {(c.writer === currentUser || currentUser === ADMIN_ID) && (
                <div className="comment-action-links">
                  <span 
                    className="comment-action-link" 
                    onClick={() => startEdit(c.id, c.text)}
                  >
                    수정
                  </span>
                  <span 
                    className="comment-action-link comment-delete-link" 
                    onClick={() => handleDelete(c.id, c.writer)}
                  >
                    삭제
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          placeholder="댓글 입력"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="comment-form-textarea"
        />
        <button type="submit" className="comment-form-button">
          등록
        </button>
      </form>
    </div>
  );
}

export default CommentSection;

