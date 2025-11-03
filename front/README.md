# OP.GG 클론 - React + Vite 기반

이 레포는 OP.GG의 전적 검색 결과 페이지와 커뮤니티 기능을 포함한 확장 가능한 구조로 리팩터링한 프로젝트입니다.

## 📋 팀 협업 가이드

### 🎯 역할 분담
- **전적검색 담당자**: 소환사 전적 조회, 매치 히스토리, 랭크 정보 등 전적 관련 기능 개발
- **커뮤니티 담당자**: 게시판, 댓글, 좋아요 등 커뮤니티 기능 개발  
- **백엔드/서버 담당자**: API 서버 구축, 데이터베이스 설계, Riot API 연동

### 🤝 협업 워크플로우
1. **브랜치 전략**: 각 기능별로 브랜치 생성 (`feature/summoner-search`, `feature/community`, `feature/backend`)
2. **코드 리뷰**: 모든 PR은 최소 1명의 리뷰어 승인 필요
3. **충돌 해결**: Git 충돌 발생 시 팀원과 소통하여 해결
4. **테스트**: 새로운 기능 추가 시 기존 기능 동작 확인 필수

## 실행 방법

### 프론트엔드 개발 서버 실행

1) 의존성 설치

```bash
npm i
```

2) 라우터 설치(설치되어 있다면 건너뛰기)

```bash
npm i react-router-dom
```

3) 개발 서버 실행

```bash
npm run dev
```

### 백엔드 Docker 이미지 실행 (필수)

프론트엔드가 백엔드 API를 호출하므로, 먼저 백엔드 서버를 실행해야 합니다.

#### 실행 방법

1. **터미널에서 실행** (권장)
   ```bash
   cd front
   docker pull paqas/lol-backend:ver1.3
   docker-compose -f docker-compose.backend.yml up -d
   ```

2. **Docker Desktop에서 실행**
   - Docker Desktop 실행
   - 왼쪽 사이드바에서 "Containers" 또는 "Images" 선택
   - 우측 상단 "..." 메뉴 → "Import from file" 또는 "Compose" 선택
   - 또는 `docker-compose.backend.yml` 파일을 Docker Desktop에 드래그 앤 드롭
   - 실행 버튼 클릭

**완료!** 환경변수는 `.env.backend` 파일에 설정되어 있어 바로 실행됩니다.

**중지:**
```bash
docker-compose -f docker-compose.backend.yml down
```

#### 방법 2: docker run 사용

```bash
docker pull paqas/lol-backend:ver1.3

docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e TNS_ADMIN=/app/wallet \
  -e DB_TNS_NAME=ruf8a028o85qyaux_high \
  -e DB_USERNAME=ADMIN \
  -e DB_PASSWORD=실제_비밀번호 \
  -e RIOT_API_KEY=실제_API_키 \
  -e JAVA_OPTS=-Duser.timezone=Asia/Seoul \
  --name lol-backend \
  paqas/lol-backend:ver1.3
```

**백엔드 서버 확인:**
- 브라우저에서 `http://localhost:8080` 접속하여 확인

## 라우팅

### 전적검색
- `/` 홈(유저 검색)
- `/summoner/:nickname` 소환사 전적 결과 페이지

### 커뮤니티
- `/community` 커뮤니티 메인
- `/community/free` 자유게시판
- `/community/guide` 공략게시판
- `/community/lolmuncheol` 롤문철
- `/community/highrecommend` 추천글
- `/community/post/:id` 게시글 상세
- `/community/write` 게시글 작성
- `/community/login` 로그인
- `/community/register` 회원가입
- `/community/admin` 관리자 페이지

## 📁 프로젝트 구조 (협업용)

### 현재 구조
```
src/
  pages/                       # 페이지 컴포넌트
    HomePage.jsx              # 홈페이지 (검색)
    SummonerPage.jsx          # 전적 결과 페이지 ⭐ 전적검색 담당
    CommunityPage.jsx         # 커뮤니티 페이지 ⭐ 커뮤니티 담당

  components/                 # 공통 컴포넌트
    common/                   # 재사용 가능한 공통 컴포넌트
      Header.jsx             # 헤더 (네비게이션, 로그인 기능)
      Footer.jsx             # 푸터
    homepage/                # 홈페이지 전용
      PopularPosts.jsx       # 인기 게시글
    summoner/                # 전적검색 전용 컴포넌트 ⭐ 전적검색 담당
      SummonerProfile.jsx    # 소환사 프로필
      GameModeNavigation.jsx # 게임 모드 네비게이션
      RankedGameCard.jsx     # 솔로랭크 카드
      FlexRankCard.jsx       # 자유랭크 카드
      RecentChampionsCard.jsx # 최근 챔피언
      MasteryCard.jsx        # 숙련도
      PlayedWithCard.jsx     # 함께 플레이한 플레이어
      RecentGamesSummary.jsx # 최근 게임 요약
      MatchHistoryItem.jsx   # 매치 히스토리 아이템
      MatchDetails.jsx       # 매치 상세
      MainContent.jsx        # 메인 컨텐츠
    community/               # 커뮤니티 전용 컴포넌트 ⭐ 커뮤니티 담당
      BoardPage.jsx          # 게시판 목록
      PostDetailPage.jsx     # 게시글 상세
      WritePost.jsx          # 게시글 작성/수정
      CommentSection.jsx     # 댓글 섹션
      Login.jsx              # 로그인
      Register.jsx           # 회원가입
      AdminPage.jsx          # 관리자 페이지

  data/                      # 데이터 관련
    api.js                   # API 호출 함수 ⭐ 백엔드 담당
    mockData.js              # 목업 데이터
    ddragon.js               # Data Dragon 유틸
    normalize.js             # 데이터 정규화
    communityApi.js          # 커뮤니티 API 함수
    commentApi.js            # 댓글 API 함수

  styles/                    # 스타일
    summoner.css             # 전적검색 페이지 스타일
    community.css            # 커뮤니티 페이지 스타일

  App.jsx                    # 메인 앱 컴포넌트
  main.jsx                   # 라우터 설정
  index.css                  # 글로벌 스타일
```

### 향후 확장 예정 구조
```
src/
  components/
    community/               # 추가 커뮤니티 기능
      LikeButton.jsx        # 좋아요 버튼
      SearchFilter.jsx      # 검색 필터
      CategoryFilter.jsx    # 카테고리 필터

  data/
    userApi.js              # 사용자 관리 API 함수 ⭐ 백엔드 담당
    notificationApi.js      # 알림 API 함수 ⭐ 백엔드 담당

  hooks/                    # 커스텀 훅
    useAuth.js              # 인증 관련 훅
    useLocalStorage.js      # 로컬스토리지 훅
    useDebounce.js          # 디바운스 훅
```

## 🛠️ 개발 가이드라인

### 컴포넌트 분리 원칙
- 페이지별 전용 컴포넌트는 `src/components/<도메인>/` 하위로 모읍니다.
- 재사용 가능성이 높아지면 `src/components/common/`로 승격해 공유 컴포넌트화합니다.
- 스타일은 페이지/도메인 단위로 폴더 분리(`styles/`)하고, CSS-in-JS 도입 시에도 동일한 경로 전략을 유지합니다.

### 코딩 컨벤션
- **컴포넌트명**: PascalCase (예: `SummonerProfile.jsx`)
- **함수명**: camelCase (예: `fetchSummonerView`)
- **상수명**: UPPER_SNAKE_CASE (예: `PLACEHOLDER_IMG`)
- **파일명**: PascalCase for components, camelCase for utilities


### 협업 시 주의사항
- **전적검색 담당자**: `src/components/summoner/`, `src/pages/SummonerPage.jsx` 수정 시 주의
- **커뮤니티 담당자**: `src/components/community/`, `src/pages/CommunityPage.jsx` 수정 시 주의  
- **백엔드 담당자**: `src/data/api.js`, 서버 관련 파일 수정 시 주의
- **공통 수정**: `src/components/common/`, `src/styles/` 수정 시 팀원들과 사전 협의

## 📚 기술 스택 및 의존성

### 현재 사용 중
- **React 19.1.1** - UI 라이브러리
- **React Router DOM 7.9.3** - 라우팅
- **Vite 7.1.7** - 빌드 도구
- **ESLint** - 코드 린팅
- **LocalStorage** - 클라이언트 사이드 데이터 저장

### 추가 예정
- **상태 관리**: Context API 또는 Redux Toolkit
- **HTTP 클라이언트**: Axios 또는 Fetch API
- **UI 컴포넌트**: 필요시 추가 라이브러리 검토

### 외부 API
- **Riot Games API** - 전적 데이터
- **Data Dragon** - 게임 리소스 (챔피언, 아이템 이미지 등)
- **Community Dragon** - 랭크 엠블럼 등

## 📝 비고

- 아이콘은 `index.html`에서 Font Awesome CDN을 사용합니다.
- ESLint 구성을 유지하며, 린트 에러가 없도록 작업했습니다.
- 현재 백엔드 API는 Mock 데이터로 동작하며, 실제 서버 연동은 백엔드 담당자가 진행 예정입니다.
- 커뮤니티 기능은 LocalStorage를 사용하여 클라이언트 사이드에서 동작합니다.
- 관리자 계정: `admin1` / `1234` (자동 생성됨)
- 로그인 상태는 Header에서 전역으로 관리됩니다.

---

## 📊 현재 개발 현황

### ✅ 완료된 기능 (전적검색)

#### 라우팅/페이지
- `src/main.jsx`: 라우터 구성(`/`, `/summoner/:nickname`, `/community`)
- `src/pages/SummonerPage.jsx`: `닉네임#태그` 파싱 → 백엔드 호출 → 화면 바인딩
- `src/pages/HomePage.jsx`: 소환사 검색 기능

<<<<<<< HEAD
#### 백엔드 연동 유틸 (Mock 데이터)
- `src/data/api.js`
  - `fetchSummonerView(gameName, tagLine)` - 소환사 정보 조회
  - `fetchRecentMatches(gameName, tagLine, count)` - 최근 매치 조회
  - `fetchDDragonVersion()` - Data Dragon 버전 조회
=======
#### 백엔드 연동 유틸 (Mock 데이터 + API 연동 준비)
- `src/data/api.js`
  - `fetchSummonerView(gameName, tagLine)` - 소환사 정보 조회
  - `fetchRecentMatches(gameName, tagLine, count)` - 최근 매치 조회 (2개로 제한)
  - `fetchDDragonVersion()` - Data Dragon 버전 조회
  - `fetchAutocompleteKeywords(query)` - 자동완성 검색어 조회
  - `fetchMatchDetail(matchId, useCache)` - 매치 상세 정보 조회
  - `fetchChampionMastery(gameName, tagLine)` - 챔피언 숙련도 조회 (상위 4개)
  - `fetchPlayedWith(gameName, tagLine)` - 함께 플레이한 소환사 조회 (상위 5개)
>>>>>>> friend/summoner2

#### Data Dragon 유틸
- `src/data/ddragon.js`
  - `buildChampionSquareUrl`, `buildItemIconUrl` - 아이콘 URL 생성
  - 스펠/룬 아이콘 매핑 함수 (추후 확장 예정)

#### 전적검색 컴포넌트
- `src/components/summoner/SummonerProfile.jsx`: 소환사 프로필 표시
- `src/components/summoner/RankedGameCard.jsx`, `FlexRankCard.jsx`: 랭크 정보
<<<<<<< HEAD
- `src/components/summoner/RecentChampionsCard.jsx`: 최근 챔피언
- `src/components/summoner/MasteryCard.jsx`: 숙련도
- `src/components/summoner/PlayedWithCard.jsx`: 함께 플레이한 플레이어
- `src/components/summoner/RecentGamesSummary.jsx`: 최근 게임 요약
- `src/components/summoner/MatchHistoryItem.jsx`: 매치 히스토리
- `src/components/summoner/MatchDetails.jsx`: 매치 상세 정보
=======
- `src/components/summoner/RecentChampionsCard.jsx`: 최근 챔피언 (탭별 데이터 표시)
- `src/components/summoner/MasteryCard.jsx`: 숙련도 (상위 4개 챔피언)
- `src/components/summoner/PlayedWithCard.jsx`: 함께 플레이한 플레이어 (상위 5명)
- `src/components/summoner/RecentGamesSummary.jsx`: 최근 게임 요약 (포지션 그래프 포함)
- `src/components/summoner/MatchHistoryItem.jsx`: 매치 히스토리
- `src/components/summoner/MatchDetails.jsx`: 매치 상세 정보
- `src/components/common/AutocompleteSearch.jsx`: 자동완성 검색 컴포넌트
>>>>>>> friend/summoner2

### ✅ 완료된 기능 (커뮤니티)

#### 커뮤니티 기능
- `src/pages/CommunityPage.jsx`: 커뮤니티 메인 페이지
- `src/components/community/BoardPage.jsx`: 게시판 목록 페이지
- `src/components/community/PostDetailPage.jsx`: 게시글 상세 보기
- `src/components/community/WritePost.jsx`: 게시글 작성/수정
- `src/components/community/CommentSection.jsx`: 댓글 기능
- `src/components/community/Login.jsx`: 로그인 기능
- `src/components/community/Register.jsx`: 회원가입 기능
- `src/components/community/AdminPage.jsx`: 관리자 페이지
- 게시글 검색/필터링
- 추천/반대 기능
- 사용자 관리 (관리자)

#### 데이터 관리
- `src/data/communityApi.js`: 커뮤니티 API 함수 (LocalStorage 기반)
- `src/data/commentApi.js`: 댓글 API 함수 (LocalStorage 기반)
- `src/styles/community.css`: 커뮤니티 스타일

<<<<<<< HEAD
=======
## 🔗 백엔드 API 명세 (백엔드 팀원용)

### 📋 필수 구현 API 엔드포인트

#### 1. 소환사 관련 API
```
GET /summoner/view/{gameName}/{tagLine}
- 소환사 기본 정보 조회
- 응답: gameName, tagLine, puuid, profileIconId, summonerLevel, revisionDate, soloRanked, flexRanked

GET /summoner/recent-matches/{gameName}/{tagLine}?count=2
- 최근 매치 히스토리 조회 (최대 2개)
- 응답: 매치 목록 (매치 ID, 게임 생성 시간, 게임 지속 시간, 큐 ID, 참가자 정보 등)

GET /summoner/match-detail/{matchId}
- 특정 매치 상세 정보 조회
- 응답: 매치 상세 데이터 (참가자 정보, 팀 정보, 챔피언 정보 등)
```

#### 2. 자동완성 API
```
GET /summoner/autocomplete?q={query}
- 검색어 자동완성 조회
- 응답: 소환사 목록 (이름, 태그, 레벨, 티어 정보 등)
```

#### 3. 챔피언 숙련도 API
```
GET /summoner/mastery/{gameName}/{tagLine}
- 챔피언 숙련도 상위 4개 조회
- 응답: 챔피언 목록 (이름, 이미지 URL, 숙련도 포인트)
```

#### 4. 함께 플레이한 소환사 API
```
GET /summoner/played-with/{gameName}/{tagLine}
- 함께 플레이한 소환사 상위 5명 조회 (최근 1주일)
- 응답: 소환사 목록 (이름, 태그, 레벨, 프로필 아이콘, 게임 수, 승률)
```

### 📊 데이터 구조 요구사항

#### 매치 데이터 구조
```javascript
{
  matchId: string,
  gameCreation: number,
  gameDuration: number,
  queueId: number, // 420: 개인랭크, 440: 자유랭크
  gameMode: string,
  participants: [
    {
      puuid: string,
      teamId: number,
      win: boolean,
      championName: string,
      summonerName: string,
      kills: number,
      deaths: number,
      assists: number,
      csTotal: number,
      champLevel: number,
      teamPosition: string, // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
      individualPosition: string,
      item0-6: number,
      summoner1Id: number,
      summoner2Id: number
    }
  ],
  teams: [{ teamId: number, win: boolean }],
  ddVer: string
}
```

#### 자동완성 데이터 구조
```javascript
[
  {
    name: string,
    tag: string,
    level: number,
    tier: string,
    rank: string,
    leaguePoints: number,
    profileIconUrl: string
  }
]
```

#### 숙련도 데이터 구조
```javascript
[
  {
    name: string,
    imageUrl: string,
    points: string
  }
]
```

#### 함께 플레이한 소환사 데이터 구조
```javascript
[
  {
    name: string,
    tag: string,
    level: number,
    iconUrl: string,
    games: string, // "6승 / 6패"
    winrate: number // 50
  }
]
```

>>>>>>> friend/summoner2
### 🚧 개발 예정 기능

#### 백엔드 서버 (백엔드 담당자)
- [ ] Express.js 서버 구축
- [ ] 데이터베이스 설계 및 연동
- [ ] Riot Games API 연동
- [ ] 사용자 인증 시스템
- [ ] 커뮤니티 API 엔드포인트

#### 전적검색 개선 (전적검색 담당자)
- [ ] 스펠/룬 아이콘 매핑 완성
- [ ] 로딩/에러 상태 스켈레톤 UI
- [ ] 매치 상세 정보 확장
- [ ] 실시간 전적 갱신

<<<<<<< HEAD
=======
### 🆕 최근 추가된 기능 (2024년 12월)

#### 1. 자동완성 검색 기능
- **파일**: `src/components/common/AutocompleteSearch.jsx`
- **기능**: 검색창에 텍스트 입력 시 연관 검색어 목록 표시
- **특징**: 
  - 디바운싱 로직 (300ms)
  - 키보드 네비게이션 지원 (↑↓ 화살표, Enter, Escape)
  - 외부 클릭 시 자동완성 목록 닫힘
  - 자동 태그 추가 기능 (#KR1 기본값, 사용자 입력 태그 우선)

#### 2. 매치 상세 정보 표시
- **파일**: `src/components/summoner/MatchDetails.jsx`
- **기능**: 매치 히스토리 아이템 클릭 시 상세 정보 표시
- **특징**:
  - 승리/패배 팀 구분 표시
  - 참가자별 상세 통계 (KDA, CS, 레벨, 아이템 등)
  - 목업 데이터와 실제 API 데이터 모두 지원

#### 3. 포지션 데이터 및 그래프
- **파일**: `src/components/summoner/RecentGamesSummary.jsx`
- **기능**: 선호 포지션 그래프 표시
- **특징**:
  - `teamPosition`과 `individualPosition` 데이터 활용
  - TOP, JNG, MID, ADC, SUP 포지션 매핑
  - 백엔드에서 DDragon API를 통해 포지션 정보 제공 예정

#### 4. 챔피언 통계 탭 기능
- **파일**: `src/components/summoner/RecentChampionsCard.jsx`
- **기능**: S2025, 개인랭크, 자유랭크 탭별 챔피언 통계 표시
- **특징**:
  - S2025 탭: 평균치 표시 (CS, KDA는 평균, 게임수와 승률은 합산)
  - 개인/자유랭크 탭: 해당 모드의 평균 성능 표시
  - 데이터 없을 때 안내 메시지 표시

#### 5. 숙련도 데이터 연동
- **파일**: `src/components/summoner/MasteryCard.jsx`
- **기능**: 챔피언 숙련도 상위 4개 표시
- **특징**:
  - 백엔드 API 연동 준비 완료
  - API 실패 시 목업 데이터 표시
  - 실시간 데이터 로딩 및 갱신

#### 6. 함께 플레이한 소환사 기능
- **파일**: `src/components/summoner/PlayedWithCard.jsx`
- **기능**: 최근 게임에서 함께 플레이한 소환사 상위 5명 표시
- **특징**:
  - 최근 1주일 데이터 기반
  - 함께 플레이한 횟수 순으로 정렬
  - 승률 표시 (60% 이상 빨간색, 50% 이상 파란색)
  - API 실패 시 목업 데이터 표시

#### 7. 검색 기능 개선
- **파일**: `src/pages/SummonerPage.jsx`
- **기능**: 태그 자동 추가 및 검색 로직 개선
- **특징**:
  - 태그 없이 검색 시 자동으로 #KR1 추가
  - 사용자가 직접 태그 입력 시 해당 태그 사용
  - URL 파라미터 파싱 개선

#### 8. 목업 데이터 확장
- **파일**: `src/data/mockData.js`
- **추가된 데이터**:
  - `autocompleteMockData`: 자동완성 검색어 목록
  - `mockMatchData`: 상세한 매치 데이터 (2개 매치)
  - `masteryData`: 챔피언 숙련도 데이터
  - `playedWithData`: 함께 플레이한 소환사 데이터
  - 포지션 데이터 (`teamPosition`, `individualPosition`)

### 🤝 백엔드 팀원 협업 가이드

#### API 연동 시 주의사항
1. **에러 처리**: 모든 API 호출은 `try-catch`로 감싸져 있으며, 실패 시 목업 데이터로 폴백됩니다.
2. **타임아웃**: API 호출은 5초 타임아웃이 설정되어 있습니다.
3. **데이터 구조**: 목업 데이터와 동일한 구조로 응답해야 합니다.
4. **CORS**: 프론트엔드(localhost:5174)에서 백엔드 API 호출을 위한 CORS 설정이 필요합니다.

#### 백엔드 서버 구축 시 필요한 설정
```javascript
// Express.js CORS 설정 예시
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
```

#### API 응답 형식 예시
```javascript
// 성공 응답
{
  "success": true,
  "data": { /* 실제 데이터 */ }
}

// 에러 응답
{
  "success": false,
  "error": "에러 메시지"
}
```

>>>>>>> friend/summoner2
### 🔧 개발 서버/프록시 설정

현재 프록시 미사용. 백엔드 서버 구축 후 `vite.config.js`에 다음 프록시 설정 추가 예정:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
=======
      '/summoner': 'http://localhost:3001',
>>>>>>> friend/summoner2
      '/api/summoner': 'http://localhost:3001',
      '/api/match': 'http://localhost:3001',
      '/api/community': 'http://localhost:3001'
    }
  }
})
```

---

<<<<<<< HEAD
=======
## 🧪 테스트 방법 (백엔드 팀원용)

### 현재 동작 확인
1. **개발 서버 실행**: `npm run dev`
2. **브라우저 접속**: `http://localhost:5174`
3. **검색 테스트**: 
   - `Faker` 입력 (자동으로 #KR1 추가됨)
   - `Faker#KR2` 입력 (사용자 지정 태그 사용)
4. **기능 확인**:
   - 자동완성 검색 목록 표시
   - 매치 히스토리 2개 표시
   - 매치 상세 정보 클릭 시 상세 데이터 표시
   - 포지션 그래프 표시
   - 챔피언 통계 탭별 데이터 표시
   - 숙련도 상위 4개 챔피언 표시
   - 함께 플레이한 소환사 상위 5명 표시

### 백엔드 API 연동 테스트
1. **백엔드 서버 실행** 후 프론트엔드에서 검색
2. **브라우저 개발자 도구** → Network 탭에서 API 호출 확인
3. **콘솔 로그** 확인:
   - `fetchSummonerView`, `fetchRecentMatches` 등 API 호출 로그
   - 목업 데이터 폴백 로그

### 목업 데이터 확인
- **파일**: `src/data/mockData.js`
- **데이터 종류**: 자동완성, 매치, 숙련도, 함께 플레이한 소환사
- **구조**: 실제 API 응답과 동일한 구조로 설계

>>>>>>> friend/summoner2
## 🎨 UI/UX 가이드라인

### 아이콘/이미지 경로 규칙
- **Data Dragon 버전**: `ddVer`를 우선 사용(없으면 최신 조회)
- **챔피언 아이콘**: `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${championName}.png`
- **아이템 아이콘**: `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/item/${itemId}.png`
- **스펠 아이콘**: `summoner.json`에서 ID→키 매핑 후 `https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/spell/${spellKey}.png`
- **룬 아이콘**: `runesReforged.json`에서 ID→icon 경로 매핑 후 `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`
- **랭크 엠블렘**: CommunityDragon `https://raw.communitydragon.org/latest/game/assets/ux/ranked-emblems/league-emblem-${tier}.png`

### 입력/검색 정규화 규칙
- **사용 유틸**: `normalizeRiotIdQuery()`
- **입력 예시**: "닉네임 #kr1" → **출력**: "닉네임#KR1" (공백 제거, 태그 대문자)

### 커뮤니티 기능 사용법
- **회원가입**: `/community/register`에서 새 계정 생성
- **로그인**: Header의 로그인 버튼 클릭 또는 `/community/login`
- **게시글 작성**: 로그인 후 커뮤니티에서 "글쓰기" 버튼 클릭
- **관리자 기능**: `admin1` 계정으로 로그인 후 "관리자 페이지" 버튼 클릭
- **추천글**: 게시글에 `highercommend` 태그가 있으면 "추천글" 배지 표시

---




---
10-10 2:52 PM 두민석
자동완성 검색 컴포넌트 (AutocompleteSearch.jsx) 추가
  검색창에 텍스트 입력 시 연관 검색어 목록 표시
  기존 검색창 디자인 유지

1. 디바운싱 로직 (300ms)
  사용자 입력이 멈춘 후 300ms 지연 후 API 호출
  불필요한 API 요청 방지로 성능 최적화

2. 라이엇 API 호출 함수 (api.js)
  https://api.example.com/keywords?q=입력값 형태의 API 호출
  실제 API가 없을 때를 대비한 목업 데이터 제공
  에러 처리 포함

3. 연관검색어 목록 UI 스타일링
  제공된 이미지와 유사한 디자인
  다크 테마 적용 (#2F3136, #36393F 배경색)
  소환사 프로필 아이콘, 이름, 태그, 레벨, 티어 정보 표시
  빨간색 강조 텍스트 (#F04747)
  호버 효과 및 선택 상태 표시

4. 검색어 클릭 시 입력창에 입력 기능
  자동완성 항목 클릭 시 검색창에 자동 입력
  자동으로 검색 실행
  목록 자동 닫힘

5. 추가 기능들
  키보드 네비게이션 (↑↓ 화살표, Enter, Escape)
  외부 클릭 시 자동완성 목록 닫힘
  로딩 상태 표시
  스크롤 가능한 목록
  커스텀 스크롤바 스타일링

🎯 사용 방법
  소환사 페이지에서 검색창에 텍스트 입력
  2글자 이상 입력 시 자동완성 목록 표시
  목록에서 원하는 소환사 클릭 또는 키보드로 선택
  자동으로 해당 소환사 페이지로 이동



