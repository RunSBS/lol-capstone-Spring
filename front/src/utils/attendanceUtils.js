// 출석 관련 유틸리티 함수들
import backendApi from '../data/backendApi.js';

// 출석 처리 및 토큰 지급 (백엔드 API 사용)
export async function processAttendance(username) {
  try {
    // 백엔드 API로 출석 보상 요청
    const result = await backendApi.claimAttendanceReward();
    
    // 백엔드 응답 형식: { attended: boolean, tokensEarned: Long, message: String }
    if (result.attended) {
      return { 
        attended: true, 
        tokensEarned: result.tokensEarned || 30 
      };
    } else {
      return { 
        attended: false, 
        tokensEarned: 0 
      };
    }
  } catch (error) {
    console.error('출석 보상 요청 실패:', error);
    // 에러 발생 시 출석하지 않은 것으로 처리
    return { attended: false, tokensEarned: 0 };
  }
}

// 사용하지 않는 함수들 (백엔드로 이동)
// 출석 상태는 이제 백엔드에서 관리하므로 프론트엔드 localStorage는 사용하지 않음
