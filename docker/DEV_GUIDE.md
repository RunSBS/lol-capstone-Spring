# 🔧 개발자용 Docker 가이드

## 📋 사전 준비

1. **루트 폴더에 `.env` 파일 확인**
   ```env
   DB_PASSWORD=lolpass1234A!
   DB_USERNAME=ADMIN
   DB_TNS_NAME=ruf8a028o85qyaux_high
   RIOT_API_KEY=RGAPI-4c0e7674-c5e5-4d30-8edd-89ca7bc3fed1
   ```

2. **Oracle Wallet 확인**
   - 프로젝트 루트의 `wallet/` 폴더에 Wallet 파일이 있어야 함

---

## 🏗️ 이미지 빌드 및 실행

### 방법 1: 스크립트 사용 (권장 ⭐)

```powershell
cd docker
.\start-docker.ps1
```

이 스크립트가 자동으로:
1. 기존 컨테이너 정리
2. Docker 이미지 빌드 (`paqas/lol-backend:ver1.3`)
3. 컨테이너 실행

---

### 방법 2: 수동 빌드

```powershell
# 1. 프로젝트 루트에서 이미지 빌드
docker build -f Dockerfile.oracle -t paqas/lol-backend:ver1.3 .

# 2. docker 폴더로 이동 후 실행
cd docker
docker-compose up -d
```

---

## 📊 실행 확인

### 로그 확인
```powershell
cd docker
docker-compose logs -f
```

### 브라우저에서 확인
```
http://localhost:8080/actuator/health
```

정상 응답이 오면 성공! ✅

---

## 🛑 중지 및 정리

### 방법 1: 스크립트 사용
```powershell
cd docker
.\stop-docker.ps1
```

### 방법 2: 수동 중지
```powershell
cd docker
docker-compose down

# 이미지도 삭제하려면
docker rmi paqas/lol-backend:ver1.3
```

---

## 🔄 이미지 다시 빌드하기

코드 변경 후 이미지를 다시 빌드하려면:

```powershell
cd docker
.\start-docker.ps1
```

또는:

```powershell
# 1. 기존 컨테이너 중지
cd docker
docker-compose down

# 2. 이미지 삭제
docker rmi paqas/lol-backend:ver1.3

# 3. 새로 빌드
cd ..
docker build -f Dockerfile.oracle -t paqas/lol-backend:ver1.3 .

# 4. 실행
cd docker
docker-compose up -d
```

---

## 📦 Docker Hub에 푸시하기

이미지를 Docker Hub에 업로드하려면:

```powershell
# 1. Docker Hub 로그인
docker login

# 2. 이미지 태깅 확인
docker images paqas/lol-backend:ver1.3

# 3. Docker Hub에 푸시
docker push paqas/lol-backend:ver1.3
```

---

## 📝 주요 명령어 요약

```powershell
# 빌드 + 실행
cd docker
.\start-docker.ps1

# 중지 + 삭제
cd docker
.\stop-docker.ps1

# 로그 확인
cd docker
docker-compose logs -f

# 컨테이너 상태 확인
docker ps

# 이미지 확인
docker images paqas/lol-backend:ver1.3
```

---

## ⚠️ 주의사항

- 이미지 빌드 전에 `wallet/` 폴더가 최신 상태인지 확인
- `.env` 파일의 환경변수가 올바른지 확인
- 빌드 시간은 약 2-3분 소요됨

