import backendApi from './backendApi';

const ADMIN_ID = "admin1";

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
    new Promise(async (resolve, reject) => {
      try {
        const comments = await backendApi.getComments(postId);
        // 백엔드 데이터를 프론트엔드 형태로 변환
        const formattedComments = comments.map(c => ({
          id: c.id,
          postId: c.postId,
          writer: c.writer,
          text: c.content,
          like: c.likes,
          dislike: c.dislikes,
          createdAt: c.createdAt
        }));
        resolve(formattedComments);
      } catch (error) {
        console.error('댓글 조회 실패:', error);
        reject(error);
      }
    }),

  getCommentCountByPostId: (postId) =>
    new Promise(async (resolve) => {
      try {
        const comments = await backendApi.getComments(postId);
        resolve(comments.length);
      } catch (error) {
        console.error('댓글 개수 조회 실패:', error);
        resolve(0);
      }
    }),

  createComment: (comment) =>
    new Promise(async (resolve, reject) => {
      try {
        const savedComment = await backendApi.createComment(comment.postId, comment.text);
        // 백엔드에서 반환된 CommentDto를 프론트엔드 형태로 변환
        const formattedComment = {
          id: savedComment.id,
          postId: savedComment.postId,
          writer: savedComment.writer,
          text: savedComment.content,
          like: savedComment.likes,
          dislike: savedComment.dislikes,
          createdAt: savedComment.createdAt
        };
        resolve(formattedComment);
      } catch (error) {
        console.error('댓글 작성 실패:', error);
        reject(error);
      }
    }),

  updateComment: (id, updatedData) =>
    new Promise((resolve, reject) => {
      // 백엔드에 수정 API가 없으므로 일단 reject
      reject("댓글 수정은 아직 지원되지 않습니다.");
    }),

  deleteComment: (id) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.deleteComment(id);
        resolve(true);
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        reject(error);
      }
    }),

  // 백엔드 API를 사용한 댓글 좋아요
  likeComment: async (id, username) => {
    try {
      await backendApi.likeComment(id);
      writeTodayVote(id, username, "like");
      return true;
    } catch (error) {
      console.error('댓글 좋아요 실패:', error);
      throw error;
    }
  },

  removeLikeComment: async (id, username) => {
    try {
      await backendApi.removeLikeComment(id);
      clearTodayVote(id, username);
      return true;
    } catch (error) {
      console.error('댓글 좋아요 취소 실패:', error);
      throw error;
    }
  },

  dislikeComment: async (id, username) => {
    try {
      await backendApi.dislikeComment(id);
      writeTodayVote(id, username, "dislike");
      return true;
    } catch (error) {
      console.error('댓글 싫어요 실패:', error);
      throw error;
    }
  },

  removeDislikeComment: async (id, username) => {
    try {
      await backendApi.removeDislikeComment(id);
      clearTodayVote(id, username);
      return true;
    } catch (error) {
      console.error('댓글 싫어요 취소 실패:', error);
      throw error;
    }
  },

  // expose today's vote info for UI: returns { type: 'like'|'dislike'|'spent', date } or null
  getTodayVoteInfo: (commentId, username) => {
    return readTodayVote(commentId, username);
  },
};

export default commentApi;
