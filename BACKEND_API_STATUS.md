# 백엔드 API 구현 상태 및 테스트 방법

## ✅ 구현 완료

### 1. 인증 API
- ✅ `POST /auth/register` - 회원가입
- ✅ `POST /auth/login` - 로그인 (JWT 토큰 발급)

### 2. 게시글 API (DB 저장)
- ✅ `POST /api/posts` - 게시글 작성 (인증 필요)
- ✅ `GET /api/posts/{id}` - 게시글 조회 (인증 불필요)
- ✅ `PUT /api/posts/{id}` - 게시글 수정 (인증 필요, 작성자만)
- ✅ `DELETE /api/posts/{id}` - 게시글 삭제 (인증 필요, 작성자만)

### 3. 댓글 API (DB 저장)
- ✅ `POST /api/comments` - 댓글 작성 (인증 필요)
- ✅ `DELETE /api/comments/{id}` - 댓글 삭제 (인증 필요, 작성자만)

## 🗄️ 데이터베이스 테이블 구조

### POSTS 테이블
- ID (PK)
- AUTHOR_ID (FK to USERS) - 게시글 작성자
- USER_ID (FK to USERS) - 동일한 작성자 정보
- TITLE - 제목
- CONTENT - 내용
- CREATED_AT - 작성일시
- UPDATED_AT - 수정일시

### COMMENTS 테이블
- ID (PK)
- POST_ID (FK to POSTS) - 댓글이 달린 게시글
- USER_ID (FK to USERS) - 댓글 작성자
- CONTENT - 댓글 내용
- LIKES - 좋아요 수
- DISLIKES - 싫어요 수
- CREATED_AT - 작성일시

## ✅ 테스트 완료 결과

게시글 작성이 **POSTS 테이블에 저장되는 것 확인됨!**
- Post ID: 8
- Author: testuser2
- Title: "Success Test Post"

## 다음 단계: 프론트엔드 연결

프론트엔드가 백엔드 API를 사용하도록 수정해야 합니다:
1. `front/src/data/communityApi.js` 수정
2. localStorage 대신 백엔드 API 호출
3. JWT 토큰을 Authorization 헤더에 포함

## 현재 프론트엔드 상태
- ✅ UI는 완성됨
- ⚠️ localStorage에만 저장 중 (백엔드 미연결)
- 🔄 백엔드 API와 연결 필요

