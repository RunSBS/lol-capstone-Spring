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

  likeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (comment) {
        comment.like = (comment.like || 0) + 1;
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),

  removeLikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (comment) {
        comment.like = Math.max((comment.like || 1) - 1, 0);
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),

  dislikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (comment) {
        comment.dislike = (comment.dislike || 0) + 1;
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),

  removeDislikeComment: (id, username) =>
    new Promise((resolve, reject) => {
      const comments = loadComments();
      const comment = comments.find(c => c.id === Number(id));
      if (comment) {
        comment.dislike = Math.max((comment.dislike || 1) - 1, 0);
        saveComments(comments);
        resolve(true);
      } else {
        reject("댓글을 찾을 수 없습니다.");
      }
    }),
};

export default commentApi;
