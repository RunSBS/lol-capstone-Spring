# 🚀 팀원용 실행 가이드

## 📥 1단계: GitHub에서 코드 받기

### 처음 받는 경우

```bash
git clone [레포지토리 URL]
cd [프로젝트 폴더명]/front
```

### 이미 받은 경우 (코드 업데이트)

```bash
# 프로젝트 루트 폴더에서
git fetch origin
git reset --hard origin/main

# front 폴더로 이동
cd front
```

> ⚠️ **주의**: `git reset --hard`는 로컬 변경사항을 모두 삭제합니다. 작업 중인 파일이 있다면 먼저 커밋하거나 백업하세요!

---

## 🐳 2단계: Docker Desktop 준비

1. **Docker Desktop 설치 확인**
   - 설치되어 있지 않다면 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치
   
2. **Docker Desktop 실행**
   - 실행 후 왼쪽 하단에 "Docker Desktop is running" 메시지 확인

---

## ⚙️ 3단계: 백엔드 실행 (필수!)

프론트엔드가 작동하려면 백엔드 서버가 먼저 실행되어 있어야 합니다.

### 방법 1: 터미널에서 실행 (권장 ⭐)

```bash
cd front

# Docker 이미지 다운로드
docker pull paqas/lol-backend:ver1.3

# 백엔드 실행
docker-compose -f docker-compose.backend.yml up -d

# 실행 확인
docker ps
```

**✅ 성공 확인:**
- `docker ps` 명령어로 `lol-backend` 또는 `paqas-lol-backend-ver1.3` 컨테이너가 보이면 성공!

---

## 🖥️ 4단계: 프론트엔드 실행

백엔드가 실행 중인 상태에서:

```bash
cd front

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

**✅ 성공 확인:**
- 터미널에 `Local: http://localhost:5173` 메시지 표시
- 브라우저에서 자동으로 열리거나 수동으로 접속

---

## 🛑 백엔드 중지하기

작업을 마친 후:

```bash
cd front
docker-compose -f docker-compose.backend.yml down
```

---

## ❓ 문제 해결

### Q: 포트 8080이 이미 사용 중이라고 나와요
**A:** 다른 프로그램이 포트 8080을 사용 중입니다.
```bash
# 포트 사용 중인 프로그램 확인 (Windows)
netstat -ano | findstr :8080

# 해당 프로그램을 종료하거나, docker-compose.backend.yml에서 포트 변경
```

### Q: Docker 이미지를 찾을 수 없어요
**A:** 이미지 다운로드를 다시 시도하세요.
```bash
docker pull paqas/lol-backend:ver1.3
```

### Q: 컨테이너가 시작되지 않아요
**A:** 로그를 확인해보세요.
```bash
cd front
docker-compose -f docker-compose.backend.yml logs -f
```

---

## 📝 주요 명령어 요약

```bash
# 백엔드 실행
cd front
docker pull paqas/lol-backend:ver1.3
docker-compose -f docker-compose.backend.yml up -d

# 백엔드 중지
cd front
docker-compose -f docker-compose.backend.yml down

# 프론트엔드 실행
cd front
npm install  # 처음 한 번만
npm run dev
```

---

**💡 팁:** 백엔드는 포트 8080, 프론트엔드는 포트 5173에서 실행됩니다!

