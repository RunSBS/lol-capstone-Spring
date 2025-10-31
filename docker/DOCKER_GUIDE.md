# 🐳 Docker 실행 가이드

## 👥 팀원용 가이드 (GitHub에서 받아서 실행)

### 1️⃣ GitHub에서 코드 받기

```bash
git clone [레포지토리 URL]
cd [프론트엔드 폴더명]
```

### 2️⃣ Docker Desktop 실행

- Docker Desktop이 설치되어 있어야 합니다
- Docker Desktop을 실행합니다

### 3️⃣ 백엔드 Docker 이미지 실행

프론트엔드 폴더로 이동:

```bash
cd front
```

#### 방법 1: 터미널에서 실행 (권장)

```bash
# Docker 이미지 다운로드
docker pull paqas/lol-backend:ver1.3

# 백엔드 실행
docker-compose -f docker-compose.backend.yml up -d

# 실행 확인
docker ps
```

#### 방법 2: Docker Desktop에서 실행

1. Docker Desktop 실행
2. 왼쪽 사이드바에서 **"Containers"** 또는 **"Images"** 선택
3. **"Pull"** 버튼 클릭 → `paqas/lol-backend:ver1.3` 입력 후 다운로드
4. **"Run"** 버튼 클릭 → 다음 환경변수 설정:

   - **Container name**: `lol-backend` (선택사항)
   - **Ports**: `8080:8080` 매핑
   - **Environment variables**:
     ```
     SPRING_PROFILES_ACTIVE=docker
     TNS_ADMIN=/app/wallet
     DB_TNS_NAME=ruf8a028o85qyaux_high
     DB_USERNAME=ADMIN
     DB_PASSWORD=lolpass1234A!
     JAVA_OPTS=-Duser.timezone=Asia/Seoul
     RIOT_API_KEY=RGAPI-4c0e7674-c5e5-4d30-8edd-89ca7bc3fed1
     ```

5. **"Run"** 클릭

> 💡 **팁**: `.env.backend` 파일이 `front/` 폴더에 있으면, `docker-compose`가 자동으로 환경변수를 읽습니다!

### 4️⃣ 실행 확인

브라우저에서 다음 주소로 접속:

```
http://localhost:8080/actuator/health
```

정상 응답이 오면 성공! ✅

### 5️⃣ 백엔드 중지

```bash
cd front
docker-compose -f docker-compose.backend.yml down
```

### 6️⃣ 프론트엔드 개발 서버 실행

백엔드가 실행 중이어야 합니다!

```bash
cd front
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소) 접속

---

## 🔧 개발자용 가이드 (이미지 빌드 및 실행)

### 1️⃣ 이미지 빌드

#### 방법 1: 스크립트 사용 (권장)

```powershell
cd docker
.\start-docker.ps1
```

이 스크립트는:
- 기존 컨테이너 정리
- Docker 이미지 빌드
- 컨테이너 실행

#### 방법 2: 수동 빌드

```powershell
# 프로젝트 루트에서
docker build -f Dockerfile.oracle -t paqas/lol-backend:ver1.3 .

# 실행
cd docker
docker-compose up -d
```

### 2️⃣ 환경변수 설정

루트 폴더에 `.env` 파일이 있어야 합니다:

```env
DB_PASSWORD=lolpass1234A!
DB_USERNAME=ADMIN
DB_TNS_NAME=ruf8a028o85qyaux_high
RIOT_API_KEY=RGAPI-4c0e7674-c5e5-4d30-8edd-89ca7bc3fed1
```

### 3️⃣ 실행

```powershell
cd docker
docker-compose up -d
```

### 4️⃣ 로그 확인

```powershell
cd docker
docker-compose logs -f
```

### 5️⃣ 중지 및 이미지 삭제

```powershell
cd docker
.\stop-docker.ps1
```

또는 수동:

```powershell
cd docker
docker-compose down
docker rmi paqas/lol-backend:ver1.3
```

---

## 📋 주요 명령어 요약

### 팀원용
```bash
cd front
docker pull paqas/lol-backend:ver1.3
docker-compose -f docker-compose.backend.yml up -d
```

### 개발자용
```powershell
cd docker
.\start-docker.ps1    # 빌드 + 실행
.\stop-docker.ps1     # 중지 + 삭제 (선택)
```

---

## ⚠️ 문제 해결

### 포트 8080이 이미 사용 중일 때

```bash
# 포트를 사용하는 프로세스 확인
netstat -ano | findstr :8080

# 또는 다른 포트 사용
# docker-compose.backend.yml에서 "8080:8080" → "8081:8080"으로 변경
```

### Docker 이미지가 없을 때

```bash
docker pull paqas/lol-backend:ver1.3
```

### 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker logs [컨테이너 이름]

# 또는 docker-compose 사용
cd front
docker-compose -f docker-compose.backend.yml logs -f
```

---

## 📝 참고사항

- 백엔드는 포트 **8080**에서 실행됩니다
- 프론트엔드는 포트 **5173** (또는 Vite가 지정한 포트)에서 실행됩니다
- 백엔드가 실행 중이어야 프론트엔드가 정상 작동합니다
- Oracle Wallet은 이미지에 포함되어 있어 별도 설정이 필요 없습니다

