// 내기 관련 API 함수
import backendApi from './backendApi';

const betApi = {
  // 사용자가 투표한 내기 중 정산 완료된 것 조회
  getSettledBets: async (since) => {
    try {
      const url = since 
        ? `/api/bet/settled?since=${encodeURIComponent(since)}`
        : '/api/bet/settled';
      
      console.log('[betApi] API 호출:', url);
      const token = localStorage.getItem('accessToken');
      console.log('[betApi] 토큰 존재:', !!token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[betApi] 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[betApi] 응답 에러:', errorText);
        throw new Error(`정산 완료 내기 조회 실패: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[betApi] 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('[betApi] 정산 완료 내기 조회 실패:', error);
      throw error;
    }
  }
};

export default betApi;

