# 🐳 Docker 배포 가이드

Oracle Cloud ADB를 사용하는 Spring Boot 애플리케이션을 Docker로 배포합니다.

## 📋 사전 준비

1. **Oracle Wallet 파일** 확인
   - 경로: `C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX`
   - 이 파일이 있어야 Oracle ADB에 연결할 수 있습니다.

2. **Docker 설치** 확인
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 빠른 시작

### 1. Docker Compose로 실행

```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 2. 개별 Docker 명령어

```bash
# 이미지 빌드
docker build -f Dockerfile.oracle -t lol-backend:latest .

# 컨테이너 실행
docker run -d \
  -p 8080:8080 \
  -v C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX:/app/wallet:ro \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e TNS_ADMIN=/app/wallet \
  -e DB_TNS_NAME=ruf8a028o85qyaux_high \
  -e DB_USERNAME=ADMIN \
  -e DB_PASSWORD=jsj7443833A! \
  lol-backend:latest

# 로그 확인
docker logs -f <container-id>

# 중지 및 삭제
docker stop <container-id>
docker rm <container-id>
```

## 🔧 주요 설정

### 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `SPRING_PROFILES_ACTIVE` | Spring Profile | docker |
| `TNS_ADMIN` | Oracle Wallet 경로 | `/app/wallet` |
| `DB_TNS_NAME` | Oracle TNS 이름 | `ruf8a028o85qyaux_high` |
| `DB_USERNAME` | 데이터베이스 사용자명 | `ADMIN` |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | - |
| `JAVA_OPTS` | Java 옵션 | `-Duser.timezone=Asia/Seoul` |

### 볼륨 마운트

Oracle Wallet은 **볼륨 마운트**로 연결됩니다:

```yaml
volumes:
  - C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX:/app/wallet:ro
```

**장점**:
- ✅ Wallet이 Docker 이미지에 포함되지 않음 (보안)
- ✅ 재빌드 없이 Wallet 변경 가능
- ✅ 여러 환경에서 재사용 가능

## 🔍 트러블슈팅

### 1. 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs backend

# 컨테이너 상태 확인
docker-compose ps

# 재시작
docker-compose restart
```

### 2. Oracle 연결 실패

```bash
# Wallet 파일 확인
docker exec -it <container-id> ls -la /app/wallet

# 연결 테스트
docker exec -it <container-id> cat /app/wallet/tnsnames.ora
```

### 3. 포트 충돌

다른 포트 사용:

```yaml
ports:
  - "8081:8080"  # 호스트:8081 → 컨테이너:8080
```

## 📁 파일 구조

```
.
├── Dockerfile.oracle           # Oracle ADB용 Dockerfile
├── docker-compose.yml          # Docker Compose 설정
├── .dockerignore              # Docker 빌드 제외 파일
├── src/main/resources/
│   ├── application.yml        # 로컬 개발 설정
│   └── application-docker.yml # Docker 프로덕션 설정
└── DOCKER_DEPLOYMENT_GUIDE.md # 상세 배포 가이드
```

## 🔒 보안 고려사항

1. **비밀번호 관리**
   - Docker Secrets 사용
   - 환경변수 파일 분리 (`.env`)
   - Git에 포함하지 않음

2. **Wallet 보안**
   - Wallet 파일 암호화
   - 읽기 전용 볼륨 마운트 (`:ro`)
   - `.dockerignore`에 포함

3. **네트워크**
   - 필요한 포트만 노출
   - 방화벽 설정

## 🌐 프로덕션 배포

### 1. 환경별 설정

```bash
# 개발 환경
docker-compose -f docker-compose.yml up

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up
```

### 2. CI/CD 통합

```bash
# 빌드 및 푸시
docker build -f Dockerfile.oracle -t your-registry/lol-backend:latest .
docker push your-registry/lol-backend:latest

# 배포
docker pull your-registry/lol-backend:latest
docker-compose up -d
```

## 📚 참고 문서

- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [Oracle Cloud ADB](https://www.oracle.com/cloud/autonomous-database/)
- [Spring Boot Docker 가이드](https://spring.io/guides/gs/spring-boot-docker/)

