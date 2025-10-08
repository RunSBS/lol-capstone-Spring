import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import boardApi from "../../data/communityApi";
import CommentSection from "./CommentSection";

function PostDetailPage({ currentUser, adminId, postId }) {
  const id = postId || useParams().id;
  const [post, setPost] = useState(null);
  const [like, setLike] = useState(0);
  const [dislike, setDislike] = useState(0);
  const [userVoted, setUserVoted] = useState(null);
  const navigate = useNavigate();

  const getVoteKey = () => `post-vote-${id}-${currentUser || "guest"}`;

  useEffect(() => {
    boardApi.getPost(id).then((data) => {
      setPost(data);
      setLike(data.like || 0);
      setDislike(data.dislike || 0);
    });

    const voteInfo = JSON.parse(localStorage.getItem(getVoteKey()));
    if (voteInfo && voteInfo.date === new Date().toLocaleDateString()) {
      setUserVoted(voteInfo.type);
    } else {
      localStorage.removeItem(getVoteKey());
      setUserVoted(null);
    }
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
    if (post.writer !== currentUser && currentUser !== adminId) {
      alert("삭제는 작성자 또는 관리자만 가능합니다.");
      return;
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

  if (!post) return <div>로딩중...</div>;

  const canEdit = post.writer === currentUser || currentUser === adminId;

  return (
    <div>
      <h2>{post.title}</h2>
      <div>
        <b>{post.writer}</b> | {new Date(post.createdAt).toLocaleString()}
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
      <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: post.content }} />
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

export default PostDetailPage;
