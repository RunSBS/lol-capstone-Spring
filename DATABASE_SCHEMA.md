# 데이터베이스 테이블 구조 설명서

프론트엔드 개발 시 참고할 수 있도록 데이터베이스 테이블 구조와 사용법을 정리한 문서입니다.

## 목차

1. [사용자 관련 테이블](#1-사용자-관련-테이블)
2. [커뮤니티 관련 테이블](#2-커뮤니티-관련-테이블)
3. [베팅 관련 테이블](#3-베팅-관련-테이블)
4. [상점 관련 테이블](#4-상점-관련-테이블)
5. [토큰 관리 테이블](#5-토큰-관리-테이블)
6. [테이블 관계도](#6-테이블-관계도)

---

## 1. 사용자 관련 테이블

### 📋 USERS (회원 테이블)

커뮤니티 사용자의 기본 정보와 인증 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 사용자 고유 ID | API 응답으로 받아서 사용자 식별 |
| `username` | String(50) | 닉네임 (고유값) | 프로필에 표시, 중복 체크 필요 |
| `email` | String(120) | 로그인용 이메일 (고유값) | 로그인/회원가입 시 사용 |
| `password` | String(255) | BCrypt 암호화된 비밀번호 | 백엔드에서만 사용 (프론트엔드에서 전송) |
| `passwordField` | String(255) | PASSWORD 컬럼 (미사용) | 사용 안 함 |
| `token` | String(255) | JWT 토큰 저장 (현재 미사용) | 사용 안 함 |
| `tokenBalance` | Long | 현재 보유 토큰 잔액 | 상점, 베팅 보상 등에서 사용 |
| `role` | String(50) | 사용자 역할 (기본값: "USER") | 권한 관리 시 사용 |
| `createdAt` | Instant | 가입 일시 | 프로필에 가입일 표시 |

**프론트엔드 사용 팁:**
- 로그인 후 `/api/user/me` 엔드포인트로 현재 사용자 정보 조회
- `tokenBalance`는 실시간으로 변동되므로 주기적으로 갱신 필요
- `username`은 중복 불가, 회원가입 시 중복 체크 API 호출 필요

---

## 2. 커뮤니티 관련 테이블

### 📋 POSTS (게시글 테이블)

커뮤니티 게시글의 기본 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 게시글 고유 ID | 게시글 상세 페이지 라우팅 (`/post/:id`) |
| `userId` | Long (FK) | 작성자 ID | 작성자 정보 표시 |
| `title` | String(200) | 게시글 제목 | 게시글 목록/상세에 표시 |
| `content` | String (LOB) | 게시글 내용 | 게시글 본문 표시 (HTML/Markdown 지원 가능) |
| `category` | String(50) | 카테고리 | 필터링/탭 구분: `"free"`, `"guide"`, `"lolmuncheol"` |
| `createdAt` | Instant | 작성 시간 | 게시글 목록에 시간 표시 |
| `updatedAt` | Instant | 수정 시간 | 수정 여부 확인 및 표시 |

**관계:**
- `userId` → `USERS.id` (Many-to-One)
- `POST_REACTION` 테이블과 1:1 관계 (좋아요/싫어요 집계)

**프론트엔드 사용 팁:**
- `GET /api/posts?category=free` - 카테고리별 목록 조회
- `GET /api/posts/{id}` - 상세 조회 (PostDto 반환, 좋아요/싫어요 수 포함)
- `POST /api/posts` - 게시글 작성 시 `title`, `content`, `category` 전송
- `category`로 탭/필터링 UI 구현

**⚠️ 이미지 저장 방식:**
- **현재 구현**: 이미지는 `content` 컬럼에 **base64 인코딩된 데이터 URL**로 포함되어 저장됩니다
- 이미지 삽입 시 HTML `<img src="data:image/jpeg;base64,...">` 형태로 본문에 포함
- 별도의 파일 서버나 파일 저장 경로 없음 (DB에 직접 저장)
- 로컬 스토리지는 작성 중 임시 저장용이며, 게시글 저장 후에는 사용되지 않음
- **주의**: 큰 이미지는 DB 용량 증가 및 페이지 로딩 속도 저하를 유발할 수 있음

---

### 📋 COMMENTS (댓글 테이블)

게시글에 달린 댓글 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 댓글 고유 ID | 댓글 삭제/좋아요 API 호출 시 사용 |
| `postId` | Long (FK) | 게시글 ID | 특정 게시글의 댓글 목록 조회 |
| `userId` | Long (FK) | 작성자 ID | 댓글 작성자 정보 표시 |
| `content` | String | 댓글 내용 | 댓글 본문 표시 |
| `likes` | Long | 좋아요 수 | 댓글에 좋아요 개수 표시 |
| `dislikes` | Long | 싫어요 수 | 댓글에 싫어요 개수 표시 |
| `createdAt` | Instant | 작성 시간 | 댓글 작성 시간 표시 |
| `isDeleted` | Boolean | 삭제 여부 | 삭제된 댓글 처리 (기본값: false) |

**관계:**
- `postId` → `POSTS.id` (Many-to-One)
- `userId` → `USERS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- `GET /api/comments?postId={id}` - 게시글별 댓글 목록 조회
- `POST /api/comments` - 댓글 작성 시 `postId`, `content` 전송
- `POST /api/comments/{id}/like` - 좋아요 (취소: `DELETE`)
- `POST /api/comments/{id}/dislike` - 싫어요 (취소: `DELETE`)
- `isDeleted`가 `true`인 경우 "삭제된 댓글입니다" 등으로 표시

---

### 📋 POST_REACTION (게시글 반응 요약 테이블)

게시글의 좋아요/싫어요 집계 정보를 저장합니다. (게시글별 1개 레코드)

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 반응 요약 ID | 직접 사용 안 함 |
| `postId` | Long (FK, Unique) | 게시글 ID | 게시글 조회 시 함께 조회 |
| `likes` | Long | 좋아요 총합 | 게시글에 좋아요 개수 표시 |
| `dislikes` | Long | 싫어요 총합 | 게시글에 싫어요 개수 표시 |

**관계:**
- `postId` → `POSTS.id` (One-to-One, Unique)

**프론트엔드 사용 팁:**
- `GET /api/posts/{id}` 응답의 PostDto에 `likes`, `dislikes` 포함
- `POST /api/posts/{id}/like` - 좋아요 (취소: `DELETE`)
- `POST /api/posts/{id}/dislike` - 싫어요 (취소: `DELETE`)
- 좋아요/싫어요 버튼 클릭 시 즉시 UI 업데이트 후 API 호출 권장

---

## 3. 베팅 관련 테이블

### 📋 BETS (내기 테이블)

게시글에 연결된 투표형 내기 정보를 저장합니다. (게시글당 최대 1개)

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 내기 고유 ID | 투표 API 호출 시 사용 |
| `postId` | Long (FK, Unique) | 게시글 ID | 게시글 상세에서 내기 정보 조회 |
| `bettorId` | Long (FK) | 내기를 건 사람 ID | 내기 주최자 표시 |
| `betTitle` | String(200) | 내기 제목 | 내기 섹션에 제목 표시 |
| `optionA` | String(100) | 선택지 A | 투표 버튼 A에 표시 |
| `optionB` | String(100) | 선택지 B | 투표 버튼 B에 표시 |
| `deadline` | Instant | 투표 마감 시각 | 마감 시간 표시 및 투표 가능 여부 확인 |
| `createdAt` | Instant | 생성 시간 | 내기 생성 시간 표시 |

**관계:**
- `postId` → `POSTS.id` (One-to-One, Unique)
- `bettorId` → `USERS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- 게시글 상세 조회 시 내기 정보 포함 여부 확인
- `deadline`과 현재 시간 비교하여 투표 가능 여부 결정
- `deadline`이 지나면 투표 버튼 비활성화 또는 "투표 마감" 표시
- 투표율 계산: `BET_VOTES` 테이블에서 각 옵션별 투표 수 집계

---

### 📋 BET_VOTES (내기 투표 기록 테이블)

사용자의 내기 투표 기록을 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 투표 기록 ID | 직접 사용 안 함 |
| `betId` | Long (FK) | 내기 ID | 특정 내기의 투표 목록 조회 |
| `userId` | Long (FK) | 투표한 사용자 ID | 사용자별 투표 여부 확인 |
| `selectedOption` | String(1) | 선택한 옵션 | `"A"` 또는 `"B"` |
| `createdAt` | Instant | 투표 시간 | 투표 시간 표시 |

**관계:**
- `betId` → `BETS.id` (Many-to-One)
- `userId` → `USERS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- 사용자가 이미 투표했는지 확인하여 투표 버튼 활성/비활성화
- 투표율 표시: 각 옵션별 투표 수를 백엔드에서 집계하여 제공
- 투표 전송 시 `betId`, `selectedOption` ("A" 또는 "B") 전송
- 같은 사용자가 중복 투표 불가 (백엔드에서 체크)

---

### 📋 BET_SETTLEMENTS (내기 정산 기록 테이블)

마감된 내기의 정산 결과를 저장합니다. (내기당 1개 레코드)

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 정산 기록 ID | 직접 사용 안 함 |
| `betId` | Long (FK, Unique) | 정산된 내기 ID | 내기 결과 조회 |
| `winnerOption` | String(1) | 승리 옵션 | `"A"` 또는 `"B"` - 결과 표시 |
| `settledAt` | Instant | 정산 완료 시각 | 정산 시간 표시 |

**관계:**
- `betId` → `BETS.id` (One-to-One, Unique)

**프론트엔드 사용 팁:**
- 내기 마감 후 정산 완료 여부 확인
- `winnerOption`으로 승리 옵션 표시 및 보상 지급 UI
- 정산 완료된 내기는 "정산 완료" 상태 표시
- 투표한 옵션과 `winnerOption` 비교하여 승패 표시

---

## 4. 상점 관련 테이블

### 📋 SHOP_ITEMS (상품 마스터 테이블)

테두리, 배너, 스티커 등 모든 상품 정보를 관리합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 상품 ID | 직접 사용 안 함 |
| `itemCode` | String(50, Unique) | 상품 코드 (고유값) | 구매/장착 API 호출 시 사용 |
| `itemType` | String(20) | 상품 타입 | 필터링: `"BORDER"`, `"BANNER"`, `"STICKER"` |
| `name` | String(100) | 상품명 | 상점 목록에 표시 |
| `description` | String(500) | 상품 설명 | 상품 상세 설명 표시 |
| `price` | Long | 토큰 가격 | 상품 가격 표시 및 구매 가능 여부 확인 |
| `imageUrl` | String(500) | 이미지 URL | 상품 이미지 표시 |
| `category` | String(50) | 스티커 카테고리 | 스티커 필터링: `"champion"`, `"item"`, `"rune"` (NULL 허용) |
| `isActive` | Boolean | 판매 중 여부 | 판매 중인 상품만 표시 (기본값: true) |
| `createdAt` | LocalDateTime | 생성 시간 | 신상품 표시 시 사용 |

**프론트엔드 사용 팁:**
- `GET /api/shop/items?itemType=BORDER` - 타입별 상품 목록 조회
- `itemCode` 예시: `"border_gold"`, `"banner_ahri"`, `"sticker_champion_Ahri"`
- `itemType`으로 상점 탭 구분 (테두리/배너/스티커)
- `price`와 사용자의 `tokenBalance` 비교하여 구매 버튼 활성/비활성화
- `isActive`가 `false`인 상품은 목록에서 제외

---

### 📋 USER_ITEMS (사용자 보유 아이템 테이블)

사용자가 구매한 상품과 보유 수량을 관리합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 보유 아이템 ID | 장착 API 호출 시 사용 (`equipItem`) |
| `userId` | Long (FK) | 사용자 ID | 현재 사용자의 보유 아이템 조회 |
| `shopItemId` | Long (FK) | 상품 ID | 어떤 상품인지 확인 |
| `quantity` | Integer | 보유 수량 | 테두리/배너: 1, 스티커: 여러 개 가능 |
| `isEquipped` | Boolean | 장착 여부 | 현재 사용 중인 아이템 표시 (기본값: false) |
| `purchasedAt` | LocalDateTime | 구매 시간 | 구매 내역 정렬 시 사용 |

**관계:**
- `userId` → `USERS.id` (Many-to-One)
- `shopItemId` → `SHOP_ITEMS.id` (Many-to-One)
- `(userId, shopItemId)` Unique 제약 (같은 상품 중복 보유 불가)

**프론트엔드 사용 팁:**
- `GET /api/shop/my-items` - 현재 사용자의 보유 아이템 조회
- `POST /api/shop/equip/{userItemId}?equip=true` - 아이템 장착
- `POST /api/shop/equip/{userItemId}?equip=false` - 아이템 해제
- 테두리/배너는 한 번에 하나만 `isEquipped=true` 가능 (백엔드에서 처리)
- 보유 아이템 목록에서 장착 여부 표시 및 장착/해제 버튼 제공

---

### 📋 BANNER_STICKERS (배너에 부착된 스티커 테이블)

사용자 배너에 부착된 스티커의 위치 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 스티커 부착 ID | 스티커 제거/위치 업데이트 시 사용 |
| `userId` | Long (FK) | 사용자 ID | 사용자 배너의 스티커 목록 조회 |
| `shopItemId` | Long (FK) | 스티커 상품 ID | 어떤 스티커인지 확인 및 이미지 표시 |
| `positionX` | Double | X 좌표 (0.0 ~ 1.0) | 배너 내 상대적 X 위치 (비율) |
| `positionY` | Double | Y 좌표 (0.0 ~ 1.0) | 배너 내 상대적 Y 위치 (비율) |
| `width` | Double | 스티커 너비 | 스티커 크기 (px 또는 배율) |
| `height` | Double | 스티커 높이 | 스티커 크기 |
| `createdAt` | LocalDateTime | 부착 시간 | 스티커 추가 시간 |

**관계:**
- `userId` → `USERS.id` (Many-to-One)
- `shopItemId` → `SHOP_ITEMS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- `GET /api/shop/banner/stickers` - 현재 사용자 배너의 스티커 목록 조회
- `POST /api/shop/banner/sticker` - 스티커 부착 시 `itemCode`, `positionX`, `positionY`, `width`, `height` 전송
- `PUT /api/shop/banner/sticker/{id}` - 스티커 위치/크기 업데이트
- `DELETE /api/shop/banner/sticker/{id}` - 스티커 제거
- 배너 편집 화면에서 드래그 앤 드롭으로 위치 변경 시 `positionX`, `positionY` 계산
- `positionX`, `positionY`는 0.0 ~ 1.0 범위 (배너 크기 변경 시에도 비율 유지)

---

### 📋 PURCHASE_HISTORY (구매 내역 테이블)

사용자의 상품 구매 이력을 저장합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 구매 내역 ID | 직접 사용 안 함 |
| `userId` | Long (FK) | 사용자 ID | 사용자별 구매 내역 조회 |
| `shopItemId` | Long (FK) | 구매한 상품 ID | 구매한 상품 정보 표시 |
| `quantity` | Integer | 구매 수량 | 구매 개수 표시 |
| `pricePaid` | Long | 구매 당시 가격 | 구매 당시 가격 표시 (상품 가격 변동 대비) |
| `tokenBalanceBefore` | Long | 구매 전 토큰 | 거래 전 잔액 표시 |
| `tokenBalanceAfter` | Long | 구매 후 토큰 | 거래 후 잔액 표시 |
| `purchasedAt` | LocalDateTime | 구매 시간 | 구매 내역 정렬 및 표시 |

**관계:**
- `userId` → `USERS.id` (Many-to-One)
- `shopItemId` → `SHOP_ITEMS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- 구매 내역 페이지에서 사용자의 모든 구매 이력 표시
- `purchasedAt` 기준 내림차순 정렬 (최신순)
- `pricePaid`, `tokenBalanceBefore`, `tokenBalanceAfter`로 거래 상세 정보 표시
- 상품 정보는 `shopItemId`로 조인하여 표시

---

## 5. 토큰 관리 테이블

### 📋 TOKEN_TRANSACTIONS (토큰 거래 이력 테이블)

토큰 증감 이력을 추적합니다.

| 컬럼명 | 타입 | 설명 | 프론트엔드 사용 예시 |
|--------|------|------|---------------------|
| `id` | Long (PK) | 거래 이력 ID | 직접 사용 안 함 |
| `userId` | Long (FK) | 사용자 ID | 사용자별 토큰 거래 내역 조회 |
| `amount` | Long | 증감량 | `+50`, `-100` 등 (양수: 증가, 음수: 감소) |
| `balanceBefore` | Long | 거래 전 잔액 | 거래 전 잔액 표시 |
| `balanceAfter` | Long | 거래 후 잔액 | 거래 후 잔액 표시 |
| `transactionType` | String(50) | 거래 타입 | `"ATTENDANCE"`, `"BET_REWARD"`, `"PURCHASE"` 등 |
| `description` | String(200) | 거래 설명 | `"투표 승리 보상"`, `"아리 스티커 구매"` 등 |
| `createdAt` | LocalDateTime | 거래 시간 | 거래 내역 정렬 및 표시 |

**관계:**
- `userId` → `USERS.id` (Many-to-One)

**프론트엔드 사용 팁:**
- 토큰 거래 내역 페이지에서 사용자의 모든 거래 이력 표시
- `amount`가 양수면 초록색, 음수면 빨간색으로 표시
- `transactionType`으로 필터링 (출석, 보상, 구매 등)
- `description`으로 거래 내용 표시
- `createdAt` 기준 내림차순 정렬 (최신순)

---

## 6. 테이블 관계도

```
USERS (사용자)
  ├─ POSTS (게시글) ────┐
  │                     ├─ POST_REACTION (게시글 반응)
  │                     └─ COMMENTS (댓글)
  │
  ├─ BETS (내기) ───────┐
  │                     ├─ BET_VOTES (투표)
  │                     └─ BET_SETTLEMENTS (정산)
  │
  ├─ USER_ITEMS (보유 아이템) ── SHOP_ITEMS (상품)
  │
  ├─ BANNER_STICKERS (배너 스티커) ── SHOP_ITEMS (상품)
  │
  ├─ PURCHASE_HISTORY (구매 내역) ── SHOP_ITEMS (상품)
  │
  └─ TOKEN_TRANSACTIONS (토큰 거래)
```

---

## 주요 API 엔드포인트 요약

### 커뮤니티
- `GET /api/posts?category={category}` - 게시글 목록
- `GET /api/posts/{id}` - 게시글 상세 (PostDto: 좋아요/싫어요 수 포함)
- `POST /api/posts` - 게시글 작성
- `GET /api/comments?postId={id}` - 댓글 목록
- `POST /api/comments` - 댓글 작성
- `POST /api/posts/{id}/like` - 게시글 좋아요
- `POST /api/comments/{id}/like` - 댓글 좋아요

### 상점
- `GET /api/shop/items?itemType={type}` - 상품 목록
- `POST /api/shop/purchase` - 상품 구매 (`itemCode`, `quantity`)
- `GET /api/shop/my-items` - 보유 아이템 조회
- `POST /api/shop/equip/{userItemId}?equip={true|false}` - 아이템 장착/해제
- `GET /api/shop/banner/stickers` - 배너 스티커 목록
- `POST /api/shop/banner/sticker` - 스티커 부착

### 사용자
- `GET /api/user/me` - 현재 사용자 정보 (토큰 필요)

---

## 주의사항

1. **인증**: 대부분의 API는 JWT 토큰 필요 (`Authorization: Bearer {token}`)
2. **타임존**: 날짜/시간 필드는 `Instant` 또는 `LocalDateTime` 타입 (ISO 8601 형식)
3. **토큰 잔액**: `USERS.tokenBalance`는 실시간 변동되므로 주기적 갱신 필요
4. **좋아요/싫어요**: 같은 게시글/댓글에 좋아요와 싫어요 동시 선택 불가 (백엔드에서 처리)
5. **베팅 투표**: 같은 내기에 중복 투표 불가, 마감 시간(`deadline`) 확인 필수
6. **아이템 장착**: 테두리/배너는 한 번에 하나만 장착 가능

---

**마지막 업데이트**: 2024년
