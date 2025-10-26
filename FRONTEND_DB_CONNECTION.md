# 프론트엔드-백엔드 DB 연결 가이드

## ✅ 현재 상태

### 백엔드 (완료)
- ✅ 회원가입/로그인 API 구현
- ✅ 게시글 API 구현 (POSTS 테이블 저장)
- ✅ 댓글 API 구현 (COMMENTS 테이블 저장)
- ✅ JWT 인증 구현
- ✅ 게시글 작성 시 **POSTS 테이블에 저장 확인됨** (Post ID: 9)

### 프론트엔드 (수정 필요)
- ⚠️ 현재: localStorage에 저장 (로컬 환경만)
- 🔄 필요: 백엔드 API 호출하여 DB에 저장

## 🔧 프론트엔드 수정 방법

`front/src/data/communityApi.js` 파일을 수정하여 백엔드 API를 호출하도록 변경:

```javascript
import backendApi from './backendApi';

const boardApi = {
  createPost: async (postData) => {
    // 로그인 여부 확인
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error("로그인이 필요합니다");
    
    // 백엔드 API 호출
    return await backendApi.createPost(postData);
  },
  
  // 기존 localStorage 로직은 주석 처리 또는 제거
  // ...
}
```

## ✅ 확인된 사항

1. **게시글 작성** - POSTS 테이블에 저장 확인됨
2. **인증 필요** - 로그인한 사용자만 게시글 작성 가능
3. **데이터베이스 저장** - localStorage가 아닌 Oracle DB에 저장

## 📋 다음 테스트

프론트엔드에서:
1. 로그인
2. 게시글 작성
3. Oracle DB에서 POSTS 테이블 확인
4. 댓글 작성
5. Oracle DB에서 COMMENTS 테이블 확인

