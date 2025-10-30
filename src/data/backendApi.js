// 백엔드 API와 통신하는 모듈
const API_BASE_URL = 'http://localhost:8080';

// JWT 토큰 가져오기
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

const backendApi = {
  // 게시글 목록 조회
  getPosts: async (category) => {
    const url = category 
      ? `${API_BASE_URL}/api/posts?category=${category}`
      : `${API_BASE_URL}/api/posts`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('게시글 목록 조회 실패');
    }

    return await response.json();
  },

  // 게시글 작성
  createPost: async (postData) => {
    const token = localStorage.getItem('accessToken');
    console.log('Sending POST request with token:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
        category: postData.category
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('POST request failed:', response.status, errorText);
      throw new Error(errorText || '게시글 작성 실패');
    }

    return await response.json();
  },

  // 게시글 조회
  getPost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('게시글 조회 실패');
    }

    return await response.json();
  },

  // 게시글 수정
  updatePost: async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: postData.title,
        content: postData.content
      })
    });

    if (!response.ok) {
      throw new Error('게시글 수정 실패');
    }

    return await response.json();
  },

  // 게시글 삭제
  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('게시글 삭제 실패');
    }

    return await response.json();
  },

  // 댓글 조회
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/comments?postId=${postId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('댓글 조회 실패');
    }

    return await response.json();
  },

  // 댓글 작성
  createComment: async (postId, content) => {
    const token = localStorage.getItem('accessToken');
    console.log('Creating comment with token:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        postId: postId,
        content: content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Comment creation failed:', response.status, errorText);
      throw new Error(errorText || '댓글 작성 실패');
    }

    return await response.json();
  },

  // 댓글 삭제
  deleteComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('댓글 삭제 실패');
    }

    return await response.json();
  },

  // 게시글 좋아요
  likePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('좋아요 실패');
    }

    return await response.json();
  },

  // 게시글 싫어요
  dislikePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/dislike`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('싫어요 실패');
    }

    return await response.json();
  },

  // 게시글 좋아요 취소
  removeLikePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('좋아요 취소 실패');
    }

    return await response.json();
  },

  // 게시글 싫어요 취소
  removeDislikePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/dislike`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('싫어요 취소 실패');
    }

    return await response.json();
  },

  // 댓글 좋아요
  likeComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('좋아요 실패');
    }

    return await response.json();
  },

  // 댓글 싫어요
  dislikeComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/dislike`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('싫어요 실패');
    }

    return await response.json();
  },

  // 댓글 좋아요 취소
  removeLikeComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('좋아요 취소 실패');
    }

    return await response.json();
  },

  // 댓글 싫어요 취소
  removeDislikeComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}/dislike`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('싫어요 취소 실패');
    }

    return await response.json();
  }
};

export default backendApi;

