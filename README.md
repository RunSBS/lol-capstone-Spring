# OP.GG 클론 - React + Vite 기반

이 레포는 OP.GG의 전적 검색 결과 페이지를 확장 가능한 구조로 리팩터링한 프로젝트입니다.

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

## 라우팅

- `/` 홈(유저 검색)
- `/summoner/:nickname` 소환사 전적 결과 페이지
- `/community` 커뮤니티(향후 개발)

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
      Header.jsx             # 헤더 (네비게이션)
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

  data/                      # 데이터 관련
    api.js                   # API 호출 함수 ⭐ 백엔드 담당
    mockData.js              # 목업 데이터
    ddragon.js               # Data Dragon 유틸
    normalize.js             # 데이터 정규화

  styles/                    # 스타일
    summoner.css             # 전적검색 페이지 스타일

  App.jsx                    # 메인 앱 컴포넌트
  main.jsx                   # 라우터 설정
  index.css                  # 글로벌 스타일
```

### 확장 예정 구조 (커뮤니티 기능 추가)
```
src/
  components/
    community/               # 커뮤니티 전용 컴포넌트 ⭐ 커뮤니티 담당
      PostList.jsx          # 게시글 목록
      PostItem.jsx          # 게시글 아이템
      PostDetail.jsx        # 게시글 상세
      PostForm.jsx          # 게시글 작성/수정
      CommentList.jsx       # 댓글 목록
      CommentItem.jsx       # 댓글 아이템
      CommentForm.jsx       # 댓글 작성
      LikeButton.jsx        # 좋아요 버튼

  data/
    communityApi.js         # 커뮤니티 API 함수 ⭐ 백엔드 담당

  styles/
    community.css           # 커뮤니티 페이지 스타일 ⭐ 커뮤니티 담당
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

### 추가 예정 (커뮤니티 기능)
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

---

## 📊 현재 개발 현황

### ✅ 완료된 기능 (전적검색)

#### 라우팅/페이지
- `src/main.jsx`: 라우터 구성(`/`, `/summoner/:nickname`, `/community`)
- `src/pages/SummonerPage.jsx`: `닉네임#태그` 파싱 → 백엔드 호출 → 화면 바인딩
- `src/pages/HomePage.jsx`: 소환사 검색 기능

#### 백엔드 연동 유틸 (Mock 데이터)
- `src/data/api.js`
  - `fetchSummonerView(gameName, tagLine)` - 소환사 정보 조회
  - `fetchRecentMatches(gameName, tagLine, count)` - 최근 매치 조회
  - `fetchDDragonVersion()` - Data Dragon 버전 조회

#### Data Dragon 유틸
- `src/data/ddragon.js`
  - `buildChampionSquareUrl`, `buildItemIconUrl` - 아이콘 URL 생성
  - 스펠/룬 아이콘 매핑 함수 (추후 확장 예정)

#### 전적검색 컴포넌트
- `src/components/summoner/SummonerProfile.jsx`: 소환사 프로필 표시
- `src/components/summoner/RankedGameCard.jsx`, `FlexRankCard.jsx`: 랭크 정보
- `src/components/summoner/RecentChampionsCard.jsx`: 최근 챔피언
- `src/components/summoner/MasteryCard.jsx`: 숙련도
- `src/components/summoner/PlayedWithCard.jsx`: 함께 플레이한 플레이어
- `src/components/summoner/RecentGamesSummary.jsx`: 최근 게임 요약
- `src/components/summoner/MatchHistoryItem.jsx`: 매치 히스토리
- `src/components/summoner/MatchDetails.jsx`: 매치 상세 정보

### 🚧 개발 예정 기능

#### 커뮤니티 기능 (커뮤니티 담당자)
- [ ] 게시판 목록 페이지
- [ ] 게시글 상세 보기
- [ ] 게시글 작성/수정/삭제
- [ ] 댓글 기능
- [ ] 좋아요/싫어요
- [ ] 게시글 검색/필터링

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

### 🔧 개발 서버/프록시 설정

현재 프록시 미사용. 백엔드 서버 구축 후 `vite.config.js`에 다음 프록시 설정 추가 예정:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/summoner': 'http://localhost:3001',
      '/api/match': 'http://localhost:3001',
      '/api/community': 'http://localhost:3001'
    }
  }
})
```

---

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

---




---




