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
        
        // 백엔드에서 페이징된 게시글 목록 가져오기
        const response = await backendApi.getPosts(category, page, size);
        console.log('backendApi.getPosts 응답:', response)
        
        // 페이징된 응답인 경우 (content, totalPages 등이 있는 경우)
        if (response && typeof response === 'object' && 'content' in response) {
          console.log('페이징된 응답:', { 
            content: response.content?.length, 
            totalPages: response.totalPages,
            totalElements: response.totalElements 
          })
          resolve({
            content: response.content || [],
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            number: response.number || 0,
            size: response.size || size
          });
          return;
        }
        
        // 기존 방식 (배열로 반환되는 경우) - 호환성 유지
        if (Array.isArray(response)) {
          console.log('배열 응답 (기존 방식):', response.length)
          const pagedPosts = response.slice(page * size, (page + 1) * size);
          const totalPages = Math.ceil(response.length / size);
          resolve({ 
            content: pagedPosts, 
            totalPages,
            totalElements: response.length,
            number: page,
            size: size
          });
          return;
        }
        
        console.error('예상치 못한 응답 형식:', typeof response, response)
        resolve({ content: [], totalPages: 0, totalElements: 0, number: 0, size: size });
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
        
        // betAmount 추가 (롤문철 카테고리)
        if (post.betAmount !== undefined && post.betAmount !== null) {
          requestData.betAmount = post.betAmount;
        }

        const savedPost = await backendApi.createPost(requestData);
        
        resolve(savedPost);
      } catch (error) {
        console.error('게시글 작성 실패:', error);
        reject(error);
      }
    }),

  deletePost: (id, requester) =>
    new Promise(async (resolve, reject) => {
      try {
        // 백엔드 API로 게시글 삭제 (백엔드에서 권한 체크)
        await backendApi.deletePost(id);
        resolve(true);
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
        reject(error.message || "삭제 권한이 없거나 게시글을 찾을 수 없습니다.");
      }
    }),

  updatePost: (id, updatedPost) =>
    new Promise(async (resolve, reject) => {
      try {
        // 백엔드에 수정 요청
        const requestData = {
          title: updatedPost.title,
          content: updatedPost.content,
          contentB: updatedPost.contentB
        };
        
        // 백엔드 API 호출
        await backendApi.updatePost(id, requestData);
        resolve(true);
      } catch (error) {
        console.error('게시글 수정 실패:', error);
        reject(error.message || "수정 실패");
      }
    }),

  // lolmuncheol cheer APIs

  searchPosts: (keyword, category) =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('searchPosts 호출:', { keyword, category });
        
        // 백엔드에서 충분히 많은 게시글을 가져옴 (검색을 위해 1000개까지)
        const categories = category ? [category] : ["free", "guide", "lolmuncheol"];
        let allResults = [];
        
        for (const cat of categories) {
          try {
            // 백엔드에서 게시글 가져오기 (검색을 위해 충분히 많이)
            const response = await backendApi.getPosts(cat, 0, 1000);
            let posts = [];
            
            if (response && typeof response === 'object' && 'content' in response) {
              posts = response.content || [];
            } else if (Array.isArray(response)) {
              posts = response;
            }
            
            // 검색 키워드로 필터링
            const filtered = posts.filter((post) => {
              const inTitle = post.title && post.title.includes(keyword);
              const inWriter = post.writer && post.writer.includes(keyword);
              const inContent = post.content && post.content.includes(keyword);
              const inContentB = post.contentB && post.contentB.includes(keyword);
              
              return inTitle || inWriter || inContent || inContentB;
            });
            
            allResults = allResults.concat(filtered);
          } catch (error) {
            console.error(`카테고리 ${cat} 검색 실패:`, error);
            // 에러가 발생해도 계속 진행
          }
        }
        
        // 최신순으로 정렬
        allResults.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        
        console.log('검색 결과:', allResults.length, '개');
        resolve(allResults);
      } catch (error) {
        console.error('검색 실패:', error);
        reject(error);
      }
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

  // postId로 betId 조회
  getBetIdByPostId: async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/posts/${postId}/bet-id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // bet이 없는 경우
        }
        throw new Error('betId 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('betId 조회 실패:', error);
      return null;
    }
  },
};

export default boardApi;
