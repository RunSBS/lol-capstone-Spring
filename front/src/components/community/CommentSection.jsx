import React, { useEffect, useState } from "react";
import commentApi from "../../data/commentApi";
import { Link } from "react-router-dom";

const ADMIN_ID = "admin1"; // 관리자 아이디

function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [userVotes, setUserVotes] = useState({}); // 댓글별 사용자 투표 상태

  const fetchComments = () => {
    commentApi.getCommentsByPostId(postId).then(setComments);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 사용자 투표 상태 로드
  useEffect(() => {
    if (currentUser) {
      const votes = {};
      comments.forEach(comment => {
        const voteKey = `comment-vote-${comment.id}-${currentUser}`;
        const voteInfo = JSON.parse(localStorage.getItem(voteKey) || 'null');
        if (voteInfo && voteInfo.date === new Date().toLocaleDateString()) {
          votes[comment.id] = voteInfo.type;
        }
      });
      setUserVotes(votes);
    }
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
      await commentApi.deleteComment(id);
      fetchComments();
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
    await commentApi.updateComment(id, { text: editText });
    cancelEdit();
    fetchComments();
  };

  const handleVoteToggle = async (commentId, type) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const voteKey = `comment-vote-${commentId}-${currentUser}`;
    const currentVote = userVotes[commentId];

    try {
      if (currentVote === type) {
        // 같은 버튼을 다시 누른 경우 - 취소
        if (type === 'like') {
          await commentApi.removeLikeComment(commentId, currentUser);
        } else {
          await commentApi.removeDislikeComment(commentId, currentUser);
        }
        localStorage.removeItem(voteKey);
        setUserVotes(prev => ({ ...prev, [commentId]: null }));
      } else {
        // 다른 버튼을 누른 경우 - 기존 취소 후 새로 투표
        if (currentVote === 'like') {
          await commentApi.removeLikeComment(commentId, currentUser);
        } else if (currentVote === 'dislike') {
          await commentApi.removeDislikeComment(commentId, currentUser);
        }
        
        if (type === 'like') {
          await commentApi.likeComment(commentId, currentUser);
        } else {
          await commentApi.dislikeComment(commentId, currentUser);
        }
        
        localStorage.setItem(voteKey, JSON.stringify({
          date: new Date().toLocaleDateString(),
          type: type
        }));
        setUserVotes(prev => ({ ...prev, [commentId]: type }));
      }
      
      fetchComments();
    } catch (error) {
      alert("투표 중 오류가 발생했습니다: " + error);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 8, backgroundColor: "#fafafa" }}>
      <h4>댓글</h4>
      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: 6, borderBottom: "1px solid #eee", paddingBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#333" }}>
              <a href={`/user/${encodeURIComponent(c.writer)}`} target="_blank" rel="noopener noreferrer"><b>{c.writer}</b></a> | {new Date(c.createdAt).toLocaleString()}
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleVoteToggle(c.id, 'like')}>
                {userVotes[c.id] === 'like' ? "👍 추천 취소" : "👍 추천"}
              </button>
              <span style={{ margin: "0 16px", color: "#333" }}>추천: {c.like || 0}</span>
              <button onClick={() => handleVoteToggle(c.id, 'dislike')}>
                {userVotes[c.id] === 'dislike' ? "👎 반대 취소" : "👎 반대"}
              </button>
              <span style={{ margin: "0 16px", color: "#333" }}>반대: {c.dislike || 0}</span>
            </div>
          </div>
          {editingCommentId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                style={{ 
                  width: "100%", 
                  marginTop: 4,
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  maxWidth: "100%"
                }}
              />
              <button onClick={() => saveEdit(c.id)} style={{ marginRight: 5 }}>
                저장
              </button>
              <button onClick={cancelEdit}>취소</button>
            </>
          ) : (
            <>
              <div style={{ 
                marginTop: 4, 
                wordWrap: "break-word", 
                wordBreak: "break-word", 
                maxWidth: "100%",
                whiteSpace: "pre-wrap",
                color: "#333"
              }}>{c.text}</div>
              {(c.writer === currentUser || currentUser === ADMIN_ID) && (
                <>
                  <button onClick={() => startEdit(c.id, c.text)} style={{ marginTop: 4, marginRight: 5 }}>
                    수정
                  </button>
                  <button
                    style={{ marginTop: 4, color: "red", cursor: "pointer" }}
                    onClick={() => handleDelete(c.id, c.writer)}
                  >
                    삭제
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        <textarea
          placeholder="댓글 입력"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{ 
            width: "100%", 
            resize: "none",
            wordWrap: "break-word",
            wordBreak: "break-word",
            maxWidth: "100%"
          }}
        />
        <button type="submit" style={{ marginTop: 5 }}>
          등록
        </button>
      </form>
    </div>
  );
}

export default CommentSection;

