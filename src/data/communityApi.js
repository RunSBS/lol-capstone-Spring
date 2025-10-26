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
    new Promise((resolve) => {
      let posts = loadPosts(category);
      // 항상 최신순 정렬 (카테고리 상관없이)
      posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const pagedPosts = posts.slice(page * size, (page + 1) * size);
      resolve({ content: pagedPosts, totalPages: 1 });
    }),

  getPost: (id) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let allPosts = [];
      categories.forEach((cat) => {
        allPosts = allPosts.concat(loadPosts(cat));
      });
      const post = allPosts.find((p) => p.id === Number(id));
      if (post) resolve(post);
      else reject("게시글이 없습니다.");
    }),

  createPost: (post) =>
    new Promise((resolve) => {
      const posts = loadPosts(post.category);
      const newPost = {
        ...post,
        id: getNextPostId(),
        createdAt: new Date().toISOString(),
        comments: [],
        like: 0,
        dislike: 0,
        // lolmuncheol specific fields
        writerB: post.category === "lolmuncheol" ? (post.writerB || "") : undefined,
        contentB: post.category === "lolmuncheol" ? (post.contentB || "") : undefined,
        tags: post.tags || [],
      };
      posts.push(newPost);
      savePosts(post.category, posts);
      resolve(newPost);
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
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1) {
          posts[idx].like = (posts[idx].like || 0) + 1;
          updateTagsForHighRecommend(posts, idx);
          savePosts(cat, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("추천 실패");
    }),

  dislikePost: (postId) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1) {
          posts[idx].dislike = (posts[idx].dislike || 0) + 1;
          savePosts(cat, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("반대 실패");
    }),

  removeLikePost: (postId) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1) {
          posts[idx].like = Math.max((posts[idx].like || 1) - 1, 0);
          updateTagsForHighRecommend(posts, idx);
          savePosts(cat, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("추천 취소 실패");
    }),

  removeDislikePost: (postId) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1) {
          posts[idx].dislike = Math.max((posts[idx].dislike || 1) - 1, 0);
          savePosts(cat, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("반대 취소 실패");
    }),

  // 투표 관련 API
  voteOnPost: (postId, optionIndex, userId) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1 && posts[idx].vote) {
          const vote = posts[idx].vote;
          const isExpired = vote.hasEndTime && vote.endTime && new Date() > new Date(vote.endTime);
          
          if (isExpired) {
            reject("투표가 종료되었습니다.");
            return;
          }

          // 기존 투표 기록 확인
          const voteKey = `vote-${postId}-${userId}`;
          const existingVote = localStorage.getItem(voteKey);
          
          if (existingVote) {
            reject("이미 투표하셨습니다.");
            return;
          }

          // 투표 결과 업데이트
          if (!vote.results) {
            vote.results = {};
          }
          if (!vote.results[optionIndex]) {
            vote.results[optionIndex] = 0;
          }
          vote.results[optionIndex]++;

          // 투표 기록 저장
          localStorage.setItem(voteKey, JSON.stringify({
            optionIndex,
            timestamp: new Date().toISOString()
          }));

          posts[idx].vote = vote;
          savePosts(cat, posts);
          updated = true;
        }
      });
      if (updated) resolve(true);
      else reject("투표 실패");
    }),

  getVoteResults: (postId, userId) =>
    new Promise((resolve) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let voteData = null;
      let userVote = null;

      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const post = posts.find((p) => p.id === Number(postId));
        if (post && post.vote) {
          voteData = post.vote;
        }
      });

      if (userId) {
        const voteKey = `vote-${postId}-${userId}`;
        const existingVote = localStorage.getItem(voteKey);
        if (existingVote) {
          const voteInfo = JSON.parse(existingVote);
          userVote = voteInfo.optionIndex;
        }
      }

      resolve({ voteData, userVote });
    }),

  // 투표 취소 API
  removeVoteFromPost: (postId, userId) =>
    new Promise((resolve, reject) => {
      const categories = ["free", "guide", "lolmuncheol"];
      let updated = false;
      categories.forEach((cat) => {
        const posts = loadPosts(cat);
        const idx = posts.findIndex((p) => p.id === Number(postId));
        if (idx !== -1 && posts[idx].vote) {
          const vote = posts[idx].vote;
          const isExpired = vote.hasEndTime && vote.endTime && new Date() > new Date(vote.endTime);
          
          if (isExpired) {
            reject("투표가 종료되었습니다.");
            return;
          }

          // 기존 투표 기록 확인
          const voteKey = `vote-${postId}-${userId}`;
          const existingVote = localStorage.getItem(voteKey);
          
          if (!existingVote) {
            reject("투표한 기록이 없습니다.");
            return;
          }

          try {
            const voteData = JSON.parse(existingVote);
            const optionIndex = voteData.optionIndex;

            // 투표 결과에서 차감
            if (vote.results && vote.results[optionIndex] && vote.results[optionIndex] > 0) {
              vote.results[optionIndex]--;
            }

            // 투표 기록 삭제
            localStorage.removeItem(voteKey);

            posts[idx].vote = vote;
            savePosts(cat, posts);
            updated = true;
          } catch (error) {
            reject("투표 취소 중 오류가 발생했습니다.");
            return;
          }
        }
      });
      if (updated) resolve(true);
      else reject("투표 취소 실패");
    }),
};

export default boardApi;
