import React, { useEffect, useState } from "react";
import commentApi from "../../data/commentApi";

const ADMIN_ID = "admin1"; // 관리자 아이디

function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchComments = () => {
    commentApi.getCommentsByPostId(postId).then(setComments);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

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

  const increaseLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.likeComment(id, currentUser);
      fetchComments();
    } catch (error) {
      alert(error);
    }
  };

  const decreaseLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.removeLikeComment(id, currentUser);
      fetchComments();
    } catch (error) {
      alert(error);
    }
  };

  const increaseDislike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.dislikeComment(id, currentUser);
      fetchComments();
    } catch (error) {
      alert(error);
    }
  };

  const decreaseDislike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await commentApi.removeDislikeComment(id, currentUser);
      fetchComments();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 8, backgroundColor: "#fafafa" }}>
      <h4>댓글</h4>
      {comments.map((c) => (
        <div key={c.id} style={{ marginBottom: 6, borderBottom: "1px solid #eee", paddingBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <b>{c.writer}</b> | {new Date(c.createdAt).toLocaleString()}
            </div>
            <div>
              추천: {c.like || 0} &nbsp;
              <button onClick={() => increaseLike(c.id)}>👍</button>
              <button onClick={() => decreaseLike(c.id)}>👎 취소</button>
              &nbsp;&nbsp; 반대: {c.dislike || 0} &nbsp;
              <button onClick={() => increaseDislike(c.id)}>👎</button>
              <button onClick={() => decreaseDislike(c.id)}>👍 취소</button>
            </div>
          </div>
          {editingCommentId === c.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: 4 }}
              />
              <button onClick={() => saveEdit(c.id)} style={{ marginRight: 5 }}>
                저장
              </button>
              <button onClick={cancelEdit}>취소</button>
            </>
          ) : (
            <>
              <div style={{ marginTop: 4 }}>{c.text}</div>
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
          style={{ width: "100%", resize: "none" }}
        />
        <button type="submit" style={{ marginTop: 5 }}>
          등록
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
