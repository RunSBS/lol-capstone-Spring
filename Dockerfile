# 1. JDK 이미지 기반
FROM eclipse-temurin:17-jdk-alpine AS builder

# 2. 빌드 단계
WORKDIR /app
COPY . .
RUN ./gradlew clean bootJar --no-daemon

# 3. 런타임 이미지
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 4. 환경변수 및 실행
ENV TZ=Asia/Seoul
EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]