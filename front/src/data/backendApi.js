// 백엔드 API와 통신하는 모듈
// Vite proxy를 통해 /api로 요청하면 http://localhost:8080/api로 전달됨
const API_BASE_URL = '/api';

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
      ? `${API_BASE_URL}/posts?category=${category}`
      : `${API_BASE_URL}/posts`;
    
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
    const response = await fetch(`${API_BASE_URL}/posts`, {
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
      throw new Error(errorText || '게시글 작성 실패');
    }

    return await response.json();
  },

  // 게시글 조회
  getPost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/comments?postId=${postId}`, {
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
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        postId: postId,
        content: content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '댓글 작성 실패');
    }

    return await response.json();
  },

  // 댓글 삭제
  deleteComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}/dislike`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}/dislike`, {
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
    const response = await fetch(`${API_BASE_URL}/comments/${id}/like`, {
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
    const response = await fetch(`${API_BASE_URL}/comments/${id}/dislike`, {
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
    const response = await fetch(`${API_BASE_URL}/comments/${id}/like`, {
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
    const response = await fetch(`${API_BASE_URL}/comments/${id}/dislike`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('싫어요 취소 실패');
    }

    return await response.json();
  },

  // ============================================
  // 상점 관련 API
  // ============================================

  // 상품 목록 조회
  getShopItems: async (itemType) => {
    const url = itemType 
      ? `${API_BASE_URL}/shop/items?itemType=${itemType}`
      : `${API_BASE_URL}/shop/items`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('상품 목록 조회 실패');
    }

    return await response.json();
  },

  // 상품 구매
  purchaseItem: async (itemCode, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/shop/purchase`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        itemCode: itemCode,
        quantity: quantity
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '상품 구매 실패');
    }

    return await response.json();
  },

  // 내 보유 아이템 조회
  getMyItems: async () => {
    const response = await fetch(`${API_BASE_URL}/shop/my-items`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('보유 아이템 조회 실패');
    }

    return await response.json();
  },

  // 아이템 장착/해제
  equipItem: async (userItemId, equip) => {
    const response = await fetch(`${API_BASE_URL}/shop/equip/${userItemId}?equip=${equip}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('아이템 장착 실패');
    }

    return await response.text();
  },

  // 배너에 스티커 부착
  addStickerToBanner: async (itemCode, positionX, positionY, width, height) => {
    const response = await fetch(`${API_BASE_URL}/shop/banner/sticker`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        itemCode: itemCode,
        positionX: positionX,
        positionY: positionY,
        width: width,
        height: height
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '스티커 부착 실패');
    }

    return await response.json();
  },

  // 배너에서 스티커 제거
  removeStickerFromBanner: async (bannerStickerId) => {
    const response = await fetch(`${API_BASE_URL}/shop/banner/sticker/${bannerStickerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('스티커 제거 실패');
    }

    return await response.text();
  },

  // 배너 스티커 목록 조회
  getBannerStickers: async () => {
    const response = await fetch(`${API_BASE_URL}/shop/banner/stickers`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('배너 스티커 조회 실패');
    }

    return await response.json();
  },

  // 배너 스티커 위치 업데이트
  updateBannerSticker: async (bannerStickerId, positionX, positionY, width, height) => {
    const response = await fetch(`${API_BASE_URL}/shop/banner/sticker/${bannerStickerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        positionX: positionX,
        positionY: positionY,
        width: width,
        height: height
      })
    });

    if (!response.ok) {
      throw new Error('스티커 위치 업데이트 실패');
    }

    return await response.json();
  },

  // ============================================
  // 사용자 관련 API
  // ============================================

  // 현재 로그인한 사용자 정보 조회
  getCurrentUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('로그인이 필요합니다. 토큰이 없습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 403) {
        // 403 에러 발생 시 토큰 제거하고 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('loginStateChanged'));
        throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
      }
      const errorText = await response.text();
      throw new Error(`사용자 정보 조회 실패: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
};

export default backendApi;

