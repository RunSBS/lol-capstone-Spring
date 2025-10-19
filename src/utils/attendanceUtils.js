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

// 출석 처리 및 토큰 지급
export function processAttendance(username) {
  const today = getTodayString();
  
  // 오늘 이미 출석했다면 false 반환
  if (hasAttendedToday(username)) {
    return { attended: false, tokensEarned: 0 };
  }
  
  // 출석 처리
  setLastAttendanceDate(username, today);
  
  // 사용자 데이터 업데이트
  const usersJson = localStorage.getItem("users") || "[]";
  const users = JSON.parse(usersJson);
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex !== -1) {
    users[userIndex].tokens = (users[userIndex].tokens || 0) + 30;
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  return { attended: true, tokensEarned: 30 };
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
