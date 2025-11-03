// 출석 관련 유틸리티 함수들

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// 사용자의 마지막 출석 날짜를 가져옴
function getLastAttendanceDate(username) {
  const key = `lastAttendance_${username}`;
  return localStorage.getItem(key);
}

// 사용자의 마지막 출석 날짜를 설정
function setLastAttendanceDate(username, date) {
  const key = `lastAttendance_${username}`;
  localStorage.setItem(key, date);
}

// 오늘 이미 출석했는지 확인
export function hasAttendedToday(username) {
  const lastAttendance = getLastAttendanceDate(username);
  const today = getTodayString();
  return lastAttendance === today;
}

// 출석 처리 및 토큰 지급 (백엔드 API 호출)
export async function processAttendance(username) {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('로그인 토큰이 없습니다.');
      return { attended: false, tokensEarned: 0, error: '로그인이 필요합니다.' };
    }

    // 백엔드 API 호출
    const response = await fetch('/api/shop/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('출석 보상 지급 실패:', response.status, errorText);
      return { attended: false, tokensEarned: 0, error: '출석 보상 지급에 실패했습니다.' };
    }

    const result = await response.json();
    
    // 출석 성공 시 localStorage에도 기록 (UI 표시용)
    if (result.attended) {
      const today = getTodayString();
      setLastAttendanceDate(username, today);
    }
    
    return {
      attended: result.attended || false,
      tokensEarned: result.tokensEarned || 0,
      newBalance: result.newBalance,
      message: result.message
    };
  } catch (error) {
    console.error('출석 보상 처리 중 오류:', error);
    return { attended: false, tokensEarned: 0, error: '출석 보상 처리 중 오류가 발생했습니다.' };
  }
}

// 자정에 출석 데이터 초기화 (실제로는 사용자가 로그인할 때 체크)
export function checkAndResetAttendance() {
  const today = getTodayString();
  const lastReset = localStorage.getItem('lastAttendanceReset');
  
  // 오늘과 다른 날이면 모든 출석 데이터 초기화
  if (lastReset !== today) {
    // 모든 사용자의 출석 기록을 확인하고 필요시 초기화
    const usersJson = localStorage.getItem("users") || "[]";
    const users = JSON.parse(usersJson);
    
    // 여기서는 실제로 초기화하지 않고, 사용자가 로그인할 때 체크하도록 함
    localStorage.setItem('lastAttendanceReset', today);
  }
}
