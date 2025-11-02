# 프로젝트 구현 결과 보고서

## 1. 프로젝트 진행 과정

### 1.1 요구사항 정의 및 분석

#### 프로젝트 개요
- **프로젝트명**: LoL 전적 검색 및 커뮤니티 플랫폼
- **목적**: 리그 오브 레전드(League of Legends) 게임 플레이어를 위한 전적 검색, 커뮤니티 기능, 상점 시스템을 제공하는 통합 웹 플랫폼

#### 주요 요구사항
1. **전적 검색 기능**
   - Riot Games API를 통한 소환사 전적 조회
   - 자동완성 검색 기능
   - 매치 상세 정보 조회
   - 최근 게임 통계 및 챔피언 숙련도 정보

2. **커뮤니티 기능**
   - 게시글 작성/수정/삭제 (자유게시판, 공략, 롤문철 카테고리)
   - 댓글 시스템
   - 투표 기능 (롤문철 글 필수)
   - 좋아요/싫어요 기능

3. **인증 및 사용자 관리**
   - JWT 기반 인증 시스템
   - 회원가입/로그인
   - 사용자 프로필 관리

4. **상점 시스템**
   - 테두리, 배너, 스티커 상품 판매
   - 토큰 기반 구매 시스템
   - 사용자 보유 아이템 관리

5. **롤문철 기능**
   - 대결 글 작성 (양쪽 작성자 지원)
   - 전적 검색 및 매치업 표시
   - 투표를 통한 승자 예측
   - 베팅 시스템

### 1.2 설계

#### 시스템 아키텍처
- **백엔드**: Spring Boot 3.5.5 (Java 21)
- **프론트엔드**: React 19.1.1 + Vite
- **데이터베이스**: Oracle Cloud ADB
- **API 연동**: Riot Games API (WebFlux 기반 비동기 처리)

#### 주요 설계 문서

##### 유즈케이스 다이어그램
1. **사용자 관리**
   - 회원가입
   - 로그인/로그아웃
   - 프로필 조회/수정

2. **전적 검색**
   - 소환사 검색 (자동완성)
   - 전적 조회
   - 매치 상세 정보 조회

3. **커뮤니티**
   - 게시글 작성/수정/삭제
   - 댓글 작성/삭제
   - 투표 참여
   - 좋아요/싫어요

4. **상점**
   - 상품 목록 조회
   - 상품 구매
   - 아이템 장착/해제

5. **롤문철**
   - 대결 글 작성
   - 전적 검색 및 매치업 설정
   - 투표 참여
   - 베팅 시스템

##### 시스템 블록 다이어그램
```
┌─────────────┐
│   Client    │ (React Frontend)
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│  Spring     │ (Backend Server)
│   Boot      │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌─▼─────┐
│Oracle│ │Riot  │
│Cloud │ │ API  │
│  DB  │ │      │
└──────┘ └──────┘
```

##### 시퀀스 다이어그램 예시 (전적 검색)
```
사용자 → Frontend → Backend → Riot API
  │         │          │         │
  │──검색──▶│          │         │
  │         │──요청───▶│         │
  │         │          │──API───▶│
  │         │          │◀─응답───│
  │         │◀─응답───│         │
  │◀─결과───│          │         │
```

##### 주요 컴포넌트 구조
- **Controller Layer**: REST API 엔드포인트 제공
- **Service Layer**: 비즈니스 로직 처리
- **Repository Layer**: 데이터베이스 접근
- **Entity Layer**: 도메인 모델
- **Security Layer**: JWT 인증 및 권한 관리

## 2. 프로젝트 구현 과정

### 2.1 개발 환경

#### 백엔드 개발 환경
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.5.5
- **빌드 도구**: Gradle
- **ORM**: Spring Data JPA
- **보안**: Spring Security + JWT (jjwt 0.12.6)
- **비동기 처리**: Spring WebFlux
- **데이터베이스 드라이버**: Oracle JDBC 23.3.0.23.09

#### 프론트엔드 개발 환경
- **언어**: JavaScript (ES6+)
- **프레임워크**: React 19.1.1
- **빌드 도구**: Vite 7.1.7
- **라우팅**: React Router DOM 7.9.3
- **HTTP 클라이언트**: Axios 1.12.2

#### 데이터베이스
- **DBMS**: Oracle Cloud ADB (Autonomous Database)
- **연결 방식**: TLS/Wallet 인증

#### 외부 API
- **Riot Games API**: 
  - Summoner API (소환사 정보)
  - Match API (전적 정보)
  - League API (랭크 정보)
  - Champion Mastery API (숙련도 정보)

#### 배포 환경
- **Docker**: 컨테이너 기반 배포
- **Docker Compose**: 다중 컨테이너 관리

### 2.2 구현 단계에서의 문제 해결 방안 및 과정 설명

#### 문제 1: Oracle Cloud ADB 연결
- **문제**: TLS/Wallet 인증을 통한 Oracle Cloud ADB 연결 실패
- **해결**: 
  - Oracle Security 라이브러리 추가 (oraclepki, osdt_core, osdt_cert)
  - Wallet 파일 경로 설정
  - SSL 인증서 설정 확인

#### 문제 2: Riot API Rate Limit
- **문제**: API 호출 제한으로 인한 429 에러
- **해결**:
  - WebFlux 기반 비동기 처리로 응답 시간 단축
  - 에러 핸들링 및 재시도 로직 구현
  - 캐싱 전략 적용 (MatchDto 캐싱)

#### 문제 3: CORS 문제
- **문제**: 프론트엔드와 백엔드 간 CORS 에러
- **해결**: SecurityConfig에서 CORS 설정 추가

#### 문제 4: JWT 토큰 관리
- **문제**: 토큰 만료 및 갱신 처리
- **해결**: JwtService를 통한 토큰 생성/검증, JwtAuthFilter에서 인증 처리

#### 문제 5: ContentEditable 미디어 삽입
- **문제**: 이미지/비디오 삽입 후 편집 불가 및 삭제 어려움
- **해결**: 
  - Zero-width space 또는 공백 문자 삽입
  - 백스페이스 키 이벤트 핸들링
  - data-media-id 속성으로 미디어 요소 추적

#### 문제 6: 비디오 썸네일 생성
- **문제**: MP4 파일을 이미지처럼 본문에 표시해야 함
- **해결**: 
  - Canvas API를 사용한 비디오 프레임 캡처
  - 비디오의 특정 시점(중간 지점 또는 1초)에서 썸네일 생성
  - 썸네일 이미지를 img 태그로 삽입

### 2.3 프로그램 코드 구성

#### 백엔드 소스 코드

##### Controller Layer
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `AuthController.java` | 인증 관련 API (회원가입, 로그인) | 팀 |
| `UserController.java` | 사용자 정보 조회 API | 팀 |
| `PostController.java` | 게시글 CRUD API | 팀 |
| `CommentController.java` | 댓글 CRUD API | 팀 |
| `ShopController.java` | 상점 관련 API (상품 조회, 구매, 장착) | 팀 |
| `BetController.java` | 베팅 관련 API (투표, 정산) | 팀 |
| `SummonerController.java` | 소환사 정보 조회 API | 팀 |
| `MatchController.java` | 전적 조회 API | 팀 |

##### Service Layer
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `AuthService.java` | 인증 비즈니스 로직 (회원가입, 로그인, JWT 생성) | 팀 |
| `PostService.java` | 게시글 비즈니스 로직 | 팀 |
| `CommentService.java` | 댓글 비즈니스 로직 | 팀 |
| `PostReactionService.java` | 좋아요/싫어요 비즈니스 로직 | 팀 |
| `ShopService.java` | 상점 비즈니스 로직 (구매, 장착 처리) | 팀 |
| `BetService.java` | 베팅 비즈니스 로직 (투표, 정산) | 팀 |
| `BannerStickerService.java` | 배너 스티커 관리 로직 | 팀 |
| `SummonerService.java` | 소환사 정보 조회 로직 (Riot API 연동) | 팀 |
| `MatchService.java` | 전적 조회 로직 (Riot API 연동, 캐싱) | 팀 |

##### Entity Layer
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `User.java` | 사용자 테이블 엔티티 | 팀 |
| `Post.java` | 게시글 테이블 엔티티 | 팀 |
| `Comment.java` | 댓글 테이블 엔티티 | 팀 |
| `PostReaction.java` | 게시글 좋아요/싫어요 엔티티 | 팀 |
| `ShopItem.java` | 상품 마스터 엔티티 | 팀 |
| `UserItem.java` | 사용자 보유 아이템 엔티티 | 팀 |
| `PurchaseHistory.java` | 구매 내역 엔티티 | 팀 |
| `TokenTransaction.java` | 토큰 거래 내역 엔티티 | 팀 |
| `Bet.java` | 내기 정보 엔티티 | 팀 |
| `BetVote.java` | 투표 기록 엔티티 | 팀 |
| `BetSettlement.java` | 베팅 정산 엔티티 | 팀 |
| `BannerSticker.java` | 배너 스티커 엔티티 | 팀 |

##### Repository Layer
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `UserRepository.java` | 사용자 데이터 접근 | 팀 |
| `PostRepository.java` | 게시글 데이터 접근 | 팀 |
| `CommentRepository.java` | 댓글 데이터 접근 | 팀 |
| `PostReactionRepository.java` | 게시글 반응 데이터 접근 | 팀 |
| `ShopItemRepository.java` | 상품 데이터 접근 | 팀 |
| `UserItemRepository.java` | 사용자 아이템 데이터 접근 | 팀 |
| `PurchaseHistoryRepository.java` | 구매 내역 데이터 접근 | 팀 |
| `TokenTransactionRepository.java` | 토큰 거래 데이터 접근 | 팀 |
| `BetRepository.java` | 베팅 데이터 접근 | 팀 |
| `BetVoteRepository.java` | 투표 데이터 접근 | 팀 |
| `BetSettlementRepository.java` | 베팅 정산 데이터 접근 | 팀 |
| `BannerStickerRepository.java` | 배너 스티커 데이터 접근 | 팀 |

##### Security & JWT
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `SecurityConfig.java` | Spring Security 설정 (CORS, 인증 규칙) | 팀 |
| `SecurityBeans.java` | Security 관련 Bean 설정 | 팀 |
| `JwtService.java` | JWT 토큰 생성/검증 서비스 | 팀 |
| `JwtAuthFilter.java` | JWT 인증 필터 | 팀 |

##### Config & DTO
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `RiotClientConfig.java` | Riot API WebClient 설정 | 팀 |
| `OracleNamingStrategy.java` | Oracle DB 네이밍 전략 | 팀 |
| `SequenceInitializer.java` | Oracle 시퀀스 초기화 | 팀 |
| `PostDto.java` | 게시글 DTO | 팀 |
| `CommentDto.java` | 댓글 DTO | 팀 |
| `ViewDto.java` | 소환사 정보 DTO | 팀 |
| `MatchDto.java` | 매치 정보 DTO | 팀 |
| `MatchSummaryDto.java` | 매치 요약 DTO | 팀 |
| `MatchDetailDto.java` | 매치 상세 DTO | 팀 |
| 기타 DTO 클래스들 | Riot API 응답 구조 매핑 | 팀 |

#### 프론트엔드 소스 코드

##### 페이지 컴포넌트
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `HomePage.jsx` | 홈페이지 (인기글, 토큰 랭킹) | 팀 |
| `SummonerPage.jsx` | 전적 검색 상세 페이지 | 팀 |
| `CommunityPage.jsx` | 커뮤니티 메인 페이지 | 팀 |
| `UserProfilePage.jsx` | 사용자 프로필 페이지 | 팀 |

##### 커뮤니티 컴포넌트
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `BoardPage.jsx` | 게시판 목록 페이지 | 팀 |
| `WritePost.jsx` | 글 작성/수정 페이지 | 팀 |
| `PostDetailPage.jsx` | 게시글 상세 페이지 | 팀 |
| `CommentSection.jsx` | 댓글 섹션 컴포넌트 | 팀 |
| `VoteSection.jsx` | 투표 설정 컴포넌트 | 팀 |
| `MediaAttachment.jsx` | 미디어 첨부 컴포넌트 | 팀 |
| `AdminPage.jsx` | 관리자 페이지 | 팀 |

##### 전적 검색 컴포넌트
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `SummonerProfile.jsx` | 소환사 프로필 표시 | 팀 |
| `RankedGameCard.jsx` | 솔로 랭크 정보 카드 | 팀 |
| `FlexRankCard.jsx` | 자유 랭크 정보 카드 | 팀 |
| `MatchHistoryItem.jsx` | 매치 히스토리 아이템 | 팀 |
| `MatchDetails.jsx` | 매치 상세 정보 | 팀 |
| `RecentGamesSummary.jsx` | 최근 게임 요약 | 팀 |
| `RecentChampionsCard.jsx` | 최근 사용 챔피언 카드 | 팀 |
| `MasteryCard.jsx` | 챔피언 숙련도 카드 | 팀 |
| `PlayedWithCard.jsx` | 함께 플레이한 소환사 카드 | 팀 |
| `MainContent.jsx` | 전적 검색 메인 컨텐츠 | 팀 |
| `GameModeNavigation.jsx` | 게임 모드 네비게이션 | 팀 |

##### 공통 컴포넌트
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `Header.jsx` | 헤더 컴포넌트 | 팀 |
| `Footer.jsx` | 푸터 컴포넌트 | 팀 |
| `AutocompleteSearch.jsx` | 자동완성 검색 컴포넌트 | 팀 |
| `StickerShop.jsx` | 스티커 상점 컴포넌트 | 팀 |
| `StickerInventory.jsx` | 스티커 인벤토리 컴포넌트 | 팀 |
| `StickerBanner.jsx` | 배너 스티커 컴포넌트 | 팀 |
| `AttendanceModal.jsx` | 출석 체크 모달 | 팀 |

##### 데이터 레이어
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `api.js` | Riot API 호출 함수 | 팀 |
| `backendApi.js` | 백엔드 API 호출 함수 | 팀 |
| `communityApi.js` | 커뮤니티 API 함수 | 팀 |
| `commentApi.js` | 댓글 API 함수 | 팀 |
| `ddragon.js` | Data Dragon 유틸리티 (아이콘 URL 생성) | 팀 |
| `normalize.js` | 데이터 정규화 함수 | 팀 |
| `normalizeFromRawParticipants.js` | 매치 데이터 정규화 | 팀 |
| `mockData.js` | 목업 데이터 | 팀 |

##### 유틸리티
| 파일명 | 설명 | 작성자 |
|--------|------|--------|
| `attendanceUtils.js` | 출석 체크 유틸리티 | 팀 |
| `stickerUtils.js` | 스티커 관련 유틸리티 | 팀 |
| `shopItemMapper.js` | 상점 아이템 매핑 | 팀 |

### 2.4 데이터베이스 테이블 및 설명

#### 사용자 관련 테이블

##### USERS (사용자)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 사용자 고유 ID (PK, 시퀀스) |
| USERNAME | VARCHAR(50) | 닉네임 (UNIQUE) |
| EMAIL | VARCHAR(120) | 이메일 (UNIQUE) |
| PASSWORD_HASH | VARCHAR(255) | 암호화된 비밀번호 (BCrypt) |
| PASSWORD | VARCHAR(255) | PASSWORD 컬럼 (사용 안 함) |
| TOKEN | VARCHAR(255) | JWT 토큰 |
| TOKEN_BALANCE | NUMBER | 토큰 잔액 |
| ROLE | VARCHAR(50) | 역할 (USER, ADMIN) |
| CREATED_AT | TIMESTAMP | 가입 일시 |

#### 커뮤니티 관련 테이블

##### POSTS (게시글)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 게시글 ID (PK, 시퀀스) |
| USER_ID | NUMBER | 작성자 ID (FK → USERS.ID) |
| AUTHOR_ID | NUMBER | 작성자 ID (USER_ID와 동일) |
| TITLE | VARCHAR(200) | 제목 |
| CONTENT | CLOB | 본문 내용 |
| CATEGORY | VARCHAR(50) | 카테고리 (free, guide, lolmuncheol) |
| CREATED_AT | TIMESTAMP | 작성 시간 |
| UPDATED_AT | TIMESTAMP | 수정 시간 |

##### COMMENTS (댓글)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 댓글 ID (PK, 시퀀스) |
| POST_ID | NUMBER | 게시글 ID (FK → POSTS.ID) |
| USER_ID | NUMBER | 작성자 ID (FK → USERS.ID) |
| CONTENT | CLOB | 댓글 내용 |
| CREATED_AT | TIMESTAMP | 작성 시간 |
| UPDATED_AT | TIMESTAMP | 수정 시간 |

##### POST_REACTIONS (게시글 반응)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 반응 ID (PK, 시퀀스) |
| POST_ID | NUMBER | 게시글 ID (FK → POSTS.ID) |
| USER_ID | NUMBER | 사용자 ID (FK → USERS.ID) |
| REACTION_TYPE | VARCHAR(20) | 반응 타입 (LIKE, DISLIKE) |
| CREATED_AT | TIMESTAMP | 생성 시간 |

#### 상점 관련 테이블

##### SHOP_ITEMS (상품 마스터)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 상품 ID (PK, 시퀀스) |
| ITEM_CODE | VARCHAR(50) | 상품 코드 (UNIQUE) |
| ITEM_TYPE | VARCHAR(20) | 상품 타입 (BORDER, BANNER, STICKER) |
| NAME | VARCHAR(100) | 상품명 |
| DESCRIPTION | VARCHAR(500) | 상품 설명 |
| PRICE | NUMBER | 토큰 가격 |
| IMAGE_URL | VARCHAR(500) | 이미지 URL |
| CATEGORY | VARCHAR(50) | 카테고리 (champion, item, rune 등) |
| IS_ACTIVE | NUMBER(1) | 판매 중 여부 |
| CREATED_AT | TIMESTAMP | 생성 시간 |

##### USER_ITEMS (사용자 보유 아이템)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | ID (PK, 시퀀스) |
| USER_ID | NUMBER | 사용자 ID (FK → USERS.ID) |
| SHOP_ITEM_ID | NUMBER | 상품 ID (FK → SHOP_ITEMS.ID) |
| QUANTITY | NUMBER | 보유 수량 |
| IS_EQUIPPED | NUMBER(1) | 장착 여부 |
| PURCHASED_AT | TIMESTAMP | 구매 시간 |
| **UNIQUE 제약**: (USER_ID, SHOP_ITEM_ID) |

##### PURCHASE_HISTORY (구매 내역)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 구매 ID (PK, 시퀀스) |
| USER_ID | NUMBER | 사용자 ID (FK → USERS.ID) |
| SHOP_ITEM_ID | NUMBER | 상품 ID (FK → SHOP_ITEMS.ID) |
| QUANTITY | NUMBER | 구매 수량 |
| TOTAL_PRICE | NUMBER | 총 구매 가격 |
| PURCHASED_AT | TIMESTAMP | 구매 시간 |

##### TOKEN_TRANSACTIONS (토큰 거래 내역)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 거래 ID (PK, 시퀀스) |
| USER_ID | NUMBER | 사용자 ID (FK → USERS.ID) |
| AMOUNT | NUMBER | 거래 금액 (양수: 획득, 음수: 사용) |
| DESCRIPTION | VARCHAR(500) | 거래 설명 |
| CREATED_AT | TIMESTAMP | 거래 시간 |

#### 베팅 관련 테이블

##### BETS (내기)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 내기 ID (PK, 시퀀스) |
| POST_ID | NUMBER | 게시글 ID (FK → POSTS.ID, UNIQUE) |
| BETTOR_ID | NUMBER | 내기를 건 사용자 ID (FK → USERS.ID) |
| BET_TITLE | VARCHAR(200) | 내기 제목 |
| OPTION_A | VARCHAR(100) | 선택지 A |
| OPTION_B | VARCHAR(100) | 선택지 B |
| DEADLINE | TIMESTAMP | 투표 마감 시각 |
| CREATED_AT | TIMESTAMP | 생성 시간 |

##### BET_VOTES (투표 기록)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 투표 ID (PK, 시퀀스) |
| BET_ID | NUMBER | 내기 ID (FK → BETS.ID) |
| USER_ID | NUMBER | 투표한 사용자 ID (FK → USERS.ID) |
| SELECTED_OPTION | VARCHAR(100) | 선택한 옵션 (A 또는 B) |
| CREATED_AT | TIMESTAMP | 투표 시간 |

##### BET_SETTLEMENTS (베팅 정산)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 정산 ID (PK, 시퀀스) |
| BET_ID | NUMBER | 내기 ID (FK → BETS.ID) |
| WINNER_OPTION | VARCHAR(100) | 승리 옵션 |
| SETTLED_AT | TIMESTAMP | 정산 시간 |

##### BANNER_STICKERS (배너 스티커)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| ID | NUMBER | 스티커 ID (PK, 시퀀스) |
| USER_ID | NUMBER | 사용자 ID (FK → USERS.ID) |
| SHOP_ITEM_ID | NUMBER | 상품 ID (FK → SHOP_ITEMS.ID) |
| POSITION_X | NUMBER | X 좌표 |
| POSITION_Y | NUMBER | Y 좌표 |
| WIDTH | NUMBER | 너비 |
| HEIGHT | NUMBER | 높이 |
| CREATED_AT | TIMESTAMP | 생성 시간 |

### 2.5 단위 테스트 결과

#### 테스트 파일 목록
| 테스트 파일 | 테스트 대상 | 결과 |
|------------|------------|------|
| `LoLApplicationTests.java` | 애플리케이션 컨텍스트 로드 | ✅ 통과 |
| `BetServiceTest.java` | BetService 비즈니스 로직 | ✅ 통과 |

#### BetServiceTest 주요 테스트 케이스
1. **투표 성공 테스트** ✅
   - 정상적인 투표 시나리오 테스트
   - 투표 기록 저장 확인

2. **중복 투표 방지 테스트** ✅
   - 동일 사용자의 중복 투표 시 예외 발생 확인
   - "이미 투표하셨습니다." 메시지 검증

3. **마감된 투표 테스트** ✅
   - 투표 마감 시간 경과 후 투표 시 예외 발생 확인
   - "투표가 마감되었습니다." 메시지 검증

4. **잘못된 옵션 테스트** ✅
   - 존재하지 않는 옵션 선택 시 예외 발생 확인

5. **베팅 정산 테스트** ✅
   - 승리 옵션에 투표한 사용자들에게 보상 지급 확인
   - 토큰 거래 내역 기록 확인

### 2.6 디버깅과 최적화 과정

#### 디버깅 과정

##### 1. Oracle DB 연결 문제
- **증상**: 애플리케이션 시작 시 DB 연결 실패
- **원인**: Wallet 파일 경로 설정 오류
- **해결**: `application.yml`에서 올바른 Wallet 경로 설정 확인

##### 2. JWT 토큰 검증 실패
- **증상**: 로그인 후 API 호출 시 403 에러
- **원인**: 토큰 서명 검증 실패
- **해결**: JwtService에서 secret key 일관성 확인 및 토큰 만료 시간 검증 로직 보완

##### 3. Riot API Rate Limit
- **증상**: API 호출 시 429 에러 빈번 발생
- **원인**: 동기식 API 호출로 인한 과도한 요청
- **해결**: WebFlux 기반 비동기 처리 및 MatchDto 캐싱 구현

##### 4. 프론트엔드 미디어 삽입 문제
- **증상**: 이미지/비디오 삽입 후 삭제 불가
- **원인**: ContentEditable에서 미디어 요소 삭제 로직 미구현
- **해결**: 백스페이스 키 이벤트 핸들링 및 미디어 요소 추적 로직 구현

##### 5. 비디오 썸네일 생성 실패
- **증상**: MP4 파일 삽입 시 썸네일 생성 실패
- **원인**: CORS 정책 및 비디오 로드 타이밍 문제
- **해결**: 비디오 이벤트 리스너 순서 조정 및 에러 핸들링 강화

#### 최적화 과정

##### 1. 데이터베이스 쿼리 최적화
- **문제**: N+1 쿼리 문제 발생
- **해결**: 
  - `@EntityGraph` 어노테이션 활용
  - `FetchType.LAZY` 적절히 사용
  - 필요한 경우 `JOIN FETCH` 사용

##### 2. API 응답 시간 최적화
- **문제**: Riot API 호출 시 긴 대기 시간
- **해결**:
  - WebFlux 비동기 처리로 병렬 요청
  - MatchDto 캐싱으로 반복 요청 방지
  - Promise.all()을 통한 병렬 처리

##### 3. 프론트엔드 렌더링 최적화
- **문제**: 대량 데이터 렌더링 시 성능 저하
- **해결**:
  - React.memo() 활용
  - useMemo, useCallback으로 불필요한 재렌더링 방지
  - 가상화(Virtualization) 적용 검토

##### 4. 이미지 최적화
- **문제**: 대용량 이미지로 인한 로딩 지연
- **해결**: 
  - 이미지 압축 로직 구현
  - Base64 인코딩 시 품질 조정 (0.8)
  - 최대 크기 제한 (800x600)

### 2.7 구현 결과 (실행 화면 캡처)

#### 주요 기능별 화면

##### 1. 홈페이지
- **기능**: 인기 롤문철 글, 토큰 랭킹 표시
- **위치**: `src/pages/HomePage.jsx`

##### 2. 전적 검색 페이지
- **기능**: 
  - 자동완성 검색
  - 소환사 프로필 정보
  - 랭크 정보 (솔로/자유)
  - 최근 게임 목록
  - 매치 상세 정보
  - 챔피언 숙련도
  - 함께 플레이한 소환사
- **위치**: `src/pages/SummonerPage.jsx`

##### 3. 커뮤니티 게시판
- **기능**:
  - 게시글 목록 (페이지네이션)
  - 카테고리별 필터링 (자유게시판, 공략, 롤문철)
  - 검색 기능
- **위치**: `src/components/community/BoardPage.jsx`

##### 4. 글 작성 페이지
- **기능**:
  - 카테고리 선택
  - 제목/내용 입력 (ContentEditable)
  - 미디어 첨부 (이미지, MP4 비디오)
  - 투표 설정 (롤문철 필수)
  - 전적 검색 및 매치업 설정 (롤문철)
- **위치**: `src/components/community/WritePost.jsx`

##### 5. 롤문철 상세 페이지
- **기능**:
  - 양쪽 작성자 내용 분할 표시
  - 전적 매치업 정보 표시
  - 투표 섹션 (본문과 댓글 사이)
  - 추천/반대 버튼
  - 댓글 시스템
- **위치**: `src/components/community/PostDetailPage.jsx`

##### 6. 상점 페이지
- **기능**:
  - 상품 목록 조회
  - 상품 구매 (토큰 결제)
  - 보유 아이템 관리
  - 배너 스티커 배치
- **위치**: 관련 컴포넌트 및 ShopController

##### 7. 사용자 프로필
- **기능**:
  - 사용자 정보 표시
  - 보유 토큰 잔액
  - 보유 아이템 목록
- **위치**: `src/pages/UserProfilePage.jsx`

## 3. 프로젝트 특징 및 성과

### 3.1 주요 특징
1. **실시간 전적 조회**: Riot Games API를 통한 최신 전적 정보 제공
2. **롤문철 기능**: 대결 글 작성 및 투표를 통한 커뮤니티 참여
3. **토큰 기반 경제 시스템**: 활동에 따른 토큰 획득 및 상점 구매
4. **JWT 기반 보안**: 안전한 인증 및 인가 시스템
5. **반응형 UI**: React 기반의 모던한 사용자 인터페이스

### 3.2 기술적 성과
- Spring Boot 3.x와 React 19의 최신 기술 스택 활용
- Oracle Cloud ADB와의 원격 데이터베이스 연동
- WebFlux를 통한 비동기 API 처리
- ContentEditable을 활용한 WYSIWYG 에디터 구현
- Canvas API를 통한 비디오 썸네일 생성

### 3.3 향후 개선 사항
1. **성능 최적화**: 
   - 데이터베이스 인덱싱 최적화
   - 프론트엔드 코드 스플리팅
   - 이미지 CDN 적용

2. **기능 확장**:
   - 실시간 알림 시스템
   - 소셜 로그인 (OAuth)
   - 파일 업로드 서버 구현

3. **테스트 강화**:
   - 통합 테스트 작성
   - E2E 테스트 도입
   - 코드 커버리지 향상

---

**작성일**: 2024년 12월  
**프로젝트 팀**: LoL Capstone Team
