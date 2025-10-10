let globalCommentId = parseInt(localStorage.getItem("globalCommentId") || "0", 10);
const ADMIN_ID = "admin1";

function getNextCommentId() {
  globalCommentId++;
  localStorage.setItem("globalCommentId", globalCommentId.toString());
  return globalCommentId;
}

function loadComments() {
  const json = localStorage.getItem("dummyComments");
  return json ? JSON.parse(json) : [];
}

function saveComments(comments) {
  localStorage.setItem("dummyComments", JSON.stringify(comments));
}

// vote record helpers: per commentId + username, store { type, date }
function getVoteKey(commentId, username) {
  return `comment-vote-${commentId}-${username || "guest"}`;
}

function getTodayString() {
  return new Date().toLocaleDateString();
}

function readTodayVote(commentId, username) {
  const key = getVoteKey(commentId, username);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.date === getTodayString()) {
      return parsed; // { type: 'like' | 'dislike', date }
    }
  } catch (e) {
    // ignore parse errors and treat as no vote today
  }
  // stale -> cleanup
  localStorage.removeItem(key);
  return null;
}

function writeTodayVote(commentId, username, type) {
  const key = getVoteKey(commentId, username);
  localStorage.setItem(key, JSON.stringify({ type, date: getTodayString() }));
}

function clearTodayVote(commentId, username) {
  const key = getVoteKey(commentId, username);
  localStorage.removeItem(key);
}

// no spend concept: cancel does not consume the day

const commentApi = {
  getCommentsByPostId: (postId) =>
    new Promise((resolve) => {
      const comments = loadComments();
      const postComments = comments
        .filter(c => c.postId === Number(postId))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      resolve(postComments);
    }),

  getCommentCountByPostId: (postId) =>
    new Promise((resolve) => {
      const comments = loadComments();
      const count = comments.filter(c => c.postId === Number(postId)).length;
      resolve(count);
    }),

  createComment: (comment) =>
    new Promise((resolve) => {
      const comments = loadComments();
      const newComment = {
        ...comment,
        id: getNextCommentId(),
        createdAt: new Date().toISOString(),
        postId: Number(comment.postId)
      };
      comments.push(newComment);
      saveComments(comments);
      resolve(newComment);
    }),

  updateComment: (id, updatedData) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const index = comments.findIndex(c => c.id === Number(id));
      if (index !== -1) {
        comments[index] = { ...comments[index], ...updatedData };
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),

  deleteComment: (id) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const index = comments.findIndex(c => c.id === Number(id));
      if (index !== -1) {
        comments.splice(index, 1);
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),

  // Only the comment author can vote. Like/dislike are mutually exclusive within a day.
  likeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (!comment) {
        reject("댓글을 찾을 수 없습니다.");
        return;
      }
      if (!username) {
        reject("로그인이 필요합니다.");
        return;
      }
      if (comment.writer !== username) {
        reject("작성자만 추천/반대할 수 있습니다.");
        return;
      }
      const vote = readTodayVote(comment.id, username);
      if (vote && vote.type === "dislike") {
        reject("이미 오늘 반대를 하셨습니다. 먼저 반대 취소를 해주세요.");
        return;
      }
      if (vote && vote.type === "like") {
        reject("이미 오늘 추천을 하셨습니다. (취소 가능)");
        return;
      }
      comment.like = (comment.like || 0) + 1;
      saveComments(comments);
      writeTodayVote(comment.id, username, "like");
      resolve(true);
    }),

  removeLikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (!comment) {
        reject("댓글을 찾을 수 없습니다.");
        return;
      }
      if (!username) {
        reject("로그인이 필요합니다.");
        return;
      }
      const vote = readTodayVote(comment.id, username);
      if (!vote || vote.type !== "like") {
        reject("오늘 추천한 기록이 없습니다.");
        return;
      }
      comment.like = Math.max((comment.like || 1) - 1, 0);
      saveComments(comments);
      // cancel clears today's vote so user can vote again
      clearTodayVote(comment.id, username);
      resolve(true);
    }),

  dislikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (!comment) {
        reject("댓글을 찾을 수 없습니다.");
        return;
      }
      if (!username) {
        reject("로그인이 필요합니다.");
        return;
      }
      if (comment.writer !== username) {
        reject("작성자만 추천/반대할 수 있습니다.");
        return;
      }
      const vote = readTodayVote(comment.id, username);
      if (vote && vote.type === "like") {
        reject("이미 오늘 추천을 하셨습니다. 먼저 추천 취소를 해주세요.");
        return;
      }
      if (vote && vote.type === "dislike") {
        reject("이미 오늘 반대를 하셨습니다. (취소 가능)");
        return;
      }
      comment.dislike = (comment.dislike || 0) + 1;
      saveComments(comments);
      writeTodayVote(comment.id, username, "dislike");
      resolve(true);
    }),

  removeDislikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (!comment) {
        reject("댓글을 찾을 수 없습니다.");
        return;
      }
      if (!username) {
        reject("로그인이 필요합니다.");
        return;
      }
      const vote = readTodayVote(comment.id, username);
      if (!vote || vote.type !== "dislike") {
        reject("오늘 반대한 기록이 없습니다.");
        return;
      }
      comment.dislike = Math.max((comment.dislike || 1) - 1, 0);
      saveComments(comments);
      // cancel clears today's vote so user can vote again
      clearTodayVote(comment.id, username);
      resolve(true);
    }),

  // expose today's vote info for UI: returns { type: 'like'|'dislike'|'spent', date } or null
  getTodayVoteInfo: (commentId, username) => {
    return readTodayVote(commentId, username);
  },
};

export default commentApi;
