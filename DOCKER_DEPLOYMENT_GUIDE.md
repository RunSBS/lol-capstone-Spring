# Docker 배포 가이드

## Oracle ADB + Docker 설정

이 프로젝트는 Oracle Cloud ADB를 사용하면서 Docker로 배포합니다.

## 1. Oracle Wallet 준비

Oracle ADB 연결을 위해 Wallet 파일이 필요합니다.

```
C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX/
```

## 2. Docker 이미지 빌드

```bash
# Oracle ADB를 사용하는 이미지 빌드
docker build -f Dockerfile.oracle -t lol-backend:latest .
```

## 3. Docker Compose로 실행

```bash
# docker-compose.yml 사용
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## 4. Oracle Wallet 포함하여 실행

현재 설정은 **볼륨 마운트** 방식입니다:

```yaml
volumes:
  - C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX:/app/wallet:ro
```

이 방식의 **장점**:
- ✅ Wallet 파일이 Docker 이미지에 포함되지 않음 (보안)
- ✅ Wallet 파일 변경 시 재빌드 불필요
- ✅ 여러 환경에서 동일한 이미지 사용 가능

## 5. 환경변수로 설정

주요 설정은 환경변수로 주입됩니다:

- `DB_TNS_NAME`: ruf8a028o85qyaux_high
- `DB_USERNAME`: ADMIN
- `DB_PASSWORD`: jsj7443833A!
- `TNS_ADMIN`: /app/wallet

## 6. 개별 Docker 명령어

```bash
# 빌드
docker build -f Dockerfile.oracle -t lol-backend:latest .

# 실행
docker run -d \
  -p 8080:8080 \
  -v C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX:/app/wallet:ro \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e DB_TNS_NAME=ruf8a028o85qyaux_high \
  -e DB_USERNAME=ADMIN \
  -e DB_PASSWORD=jsj7443833A! \
  --name lol-backend \
  lol-backend:latest

# 로그 확인
docker logs -f lol-backend

# 중지 및 삭제
docker stop lol-backend
docker rm lol-backend
```

## 7. 배포 프로세스

1. **코드 변경**
2. **이미지 빌드**: `docker build -f Dockerfile.oracle -t lol-backend:latest .`
3. **기존 컨테이너 중지**: `docker-compose down`
4. **새 이미지로 실행**: `docker-compose up -d`

## 8. Oracle Wallet 보안

⚠️ **중요**: Oracle Wallet 파일이 Docker 이미지에 포함되지 않도록 `.dockerignore`의 `Wallet_*/` 항목을 확인하세요.

실제 배포 시에는:
- Wallet 파일을 별도로 관리
- 환경변수로 주입하지 않고 볼륨 마운트 사용
- 비밀번호는 Docker Secrets 또는 환경변수로 관리

## 9. 트러블슈팅

### Wallet 경로 문제
```bash
# 컨테이너 내부 확인
docker exec -it lol-backend ls -la /app/wallet
```

### 연결 테스트
```bash
# 애플리케이션 로그 확인
docker-compose logs backend | grep -i "oracle\|datasource"
```

## 10. 프로덕션 배포

프로덕션에서는:

1. **환경별 설정 분리**
   - `application.yml` (로컬)
   - `application-docker.yml` (Docker)
   - `application-prod.yml` (프로덕션)

2. **보안 강화**
   - Oracle Wallet 파일 암호화
   - DB 비밀번호를 Docker Secrets 사용
   - 네트워크 보안 그룹 설정

3. **모니터링**
   - Health check 추가
   - 로그 중앙 수집

