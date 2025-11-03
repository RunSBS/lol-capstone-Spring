import backendApi from './backendApi';

let globalId = parseInt(localStorage.getItem("globalPostId") || "0", 10);
const adminId = "admin1";

function getStorageKeyByCategory(category) {
  return `dummyPosts_${category || "all"}`;
}

function loadPosts(category) {
  if (category === "all") {
    const categories = ["free", "guide", "lolmuncheol"];
    let allPosts = [];
    categories.forEach((cat) => {
      const json = localStorage.getItem(`dummyPosts_${cat}`);
      const posts = json ? JSON.parse(json) : [];
      allPosts = allPosts.concat(posts);
    });
    return allPosts;
  } else {
    const key = getStorageKeyByCategory(category);
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  }
}

function savePosts(category, posts) {
  const key = getStorageKeyByCategory(category);
  localStorage.setItem(key, JSON.stringify(posts));
}

function getNextPostId() {
  globalId++;
  localStorage.setItem("globalPostId", globalId.toString());
  return globalId;
}

function updateTagsForHighRecommend(posts, idx) {
  let post = posts[idx];
  const likeCount = post.like || 0;
  let tags = post.tags || [];

  if (likeCount >= 10) {
    if (!tags.includes("highrecommend")) {
      tags = [...tags, "highrecommend"];
    }
  } else {
    tags = tags.filter((tag) => tag !== "highrecommend");
  }
  posts[idx].tags = tags;
}

const boardApi = {
  getPosts: (page = 0, size = 10, category) =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('communityApi.getPosts 호출:', { page, size, category })
        
        // 백엔드에서 게시글 목록 가져오기
        const posts = await backendApi.getPosts(category);
        console.log('backendApi.getPosts 응답:', posts, '타입:', typeof posts, '배열 여부:', Array.isArray(posts))
        
        // posts가 배열이 아닌 경우 처리
        if (!Array.isArray(posts)) {
          console.error('posts가 배열이 아닙니다:', typeof posts, posts)
          resolve({ content: [], totalPages: 0 });
          return
        }
        
        // 페이지네이션
        const pagedPosts = posts.slice(page * size, (page + 1) * size);
        const totalPages = Math.ceil(posts.length / size);
        
        console.log('페이지네이션 결과:', { total: posts.length, paged: pagedPosts.length, totalPages })
        resolve({ content: pagedPosts, totalPages });
      } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        console.error('에러 상세:', error.message, error.stack);
        reject(error);
      }
    }),

  getPost: (id) =>
    new Promise(async (resolve, reject) => {
      try {
        // 백엔드에서 게시글 가져오기
        const post = await backendApi.getPost(id);
        
        // matchData가 JSON 문자열이면 객체로 파싱
        if (post.matchData && typeof post.matchData === 'string') {
          try {
            post.matchData = JSON.parse(post.matchData);
          } catch (e) {
            console.warn('matchData 파싱 실패:', e);
            post.matchData = null;
          }
        }
        
        resolve(post);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        reject("게시글이 없습니다.");
      }
    }),

  createPost: (post) =>
    new Promise(async (resolve, reject) => {
      try {
        // 백엔드에만 저장 (Oracle Cloud ADB)
        const requestData = {
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags || []
        };
        
        // writerB 추가 (롤문철 카테고리일 때 필요)
        if (post.writerB) {
          requestData.writerB = post.writerB;
        }
        
        // vote 데이터 추가
        if (post.vote) {
          requestData.vote = post.vote;
        }
        
        // matchData 추가
        if (post.matchData) {
          requestData.matchData = post.matchData;
        }

        const savedPost = await backendApi.createPost(requestData);
        
        resolve(savedPost);
      } catch (error) {
        console.error('게시글 작성 실패:', error);
        reject(error);
      }
    }),

  deletePost: (id, requester) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let deleted = false;
      categories.forEach((category) => {
        const posts = loadPosts(category);
        const index = posts.findIndex((p) => p.id === Number(id));
        if (index !== -1) {
          const isLol = posts[index].category === "lolmuncheol";
          if ((isLol && requester === adminId) || (!isLol && (posts[index].writer === requester || requester === adminId))) {
            posts.splice(index, 1);
            savePosts(category, posts);
            deleted = true;
          }
        }
      });
      if (deleted) resolve(true);
      else reject("삭제 권한이 없거나 게시글을 찾을 수 없습니다.");
    }),

  updatePost: (id, updatedPost) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((category) => {
        const posts = loadPosts(category);
        const idx = posts.findIndex((p) => p.id === Number(id));
        if (idx !== -1) {
          // For lolmuncheol, allow separate sides to be updated individually
          if (posts[idx].category === "lolmuncheol") {
            const draft = { ...posts[idx] };
            if (typeof updatedPost.title === "string") draft.title = updatedPost.title;
            if (typeof updatedPost.tags !== "undefined") draft.tags = updatedPost.tags;
            if (typeof updatedPost.content === "string") draft.content = updatedPost.content; // writerA side
            if (typeof updatedPost.contentB === "string") draft.contentB = updatedPost.contentB; // writerB side
            if (updatedPost.matchData !== undefined) draft.matchData = updatedPost.matchData;
            if (updatedPost.vote !== undefined) draft.vote = updatedPost.vote;
            posts[idx] = draft;
          } else {
            posts[idx] = { ...posts[idx], ...updatedPost };
          }
          savePosts(category, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("수정 실패");
    }),

  // lolmuncheol cheer APIs

  searchPosts: (keyword, category) =>
    new Promise((resolve) => {
      const categories = category ? [category] : ["free", "guide", "lolmuncheol"];
      let results = [];

      const commentsJson = localStorage.getItem("dummyComments") || "[]";
      const comments = JSON.parse(commentsJson);

      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        results = results.concat(
          posts.filter((post) => {
            const inTitle = post.title.includes(keyword);
            const inWriter = post.writer.includes(keyword);
            const hasCommentWithKeyword = comments.some(
              (c) => c.postId === post.id && c.text.includes(keyword)
            );
            return inTitle || inWriter || hasCommentWithKeyword;
          })
        );
      });

      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(results);
    }),

  likePost: (postId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.likePost(postId);
        resolve(true);
      } catch (error) {
        console.error('좋아요 실패:', error);
        reject("추천 실패");
      }
    }),

  dislikePost: (postId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.dislikePost(postId);
        resolve(true);
      } catch (error) {
        console.error('싫어요 실패:', error);
        reject("반대 실패");
      }
    }),

  removeLikePost: (postId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.removeLikePost(postId);
        resolve(true);
      } catch (error) {
        console.error('좋아요 취소 실패:', error);
        reject("추천 취소 실패");
      }
    }),

  removeDislikePost: (postId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.removeDislikePost(postId);
        resolve(true);
      } catch (error) {
        console.error('싫어요 취소 실패:', error);
        reject("반대 취소 실패");
      }
    }),

  // 투표 관련 API
  voteOnPost: (postId, optionIndex, userId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.voteOnPost(postId, optionIndex);
        resolve(true);
      } catch (error) {
        console.error('투표 실패:', error);
        reject(error.message || "투표 실패");
      }
    }),

  getVoteResults: (postId, userId) =>
    new Promise(async (resolve, reject) => {
      try {
        const result = await backendApi.getVoteResults(postId);
        // 백엔드 응답 형식에 맞게 변환
        resolve({
          voteData: result.voteData,
          userVote: result.userVote
        });
      } catch (error) {
        console.error('투표 결과 조회 실패:', error);
        // 에러 발생 시 기본값 반환
        resolve({ voteData: null, userVote: null });
      }
    }),

  // 투표 취소 API
  removeVoteFromPost: (postId, userId) =>
    new Promise(async (resolve, reject) => {
      try {
        await backendApi.removeVoteFromPost(postId);
        resolve(true);
      } catch (error) {
        console.error('투표 취소 실패:', error);
        reject(error.message || "투표 취소 실패");
      }
    }),
};

export default boardApi;
