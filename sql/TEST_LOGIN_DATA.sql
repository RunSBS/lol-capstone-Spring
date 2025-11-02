-- ============================================
-- 로그인 데이터 직접 확인 스크립트
-- ============================================

-- 1. 모든 사용자 목록과 비밀번호 해시 상태 확인
SELECT 
    ID,
    USERNAME,
    EMAIL,
    CASE 
        WHEN PASSWORD_HASH IS NULL OR LENGTH(PASSWORD_HASH) = 0 THEN '문제: 비밀번호 없음'
        WHEN LENGTH(PASSWORD_HASH) < 20 THEN '문제: 비밀번호 해시 길이 이상'
        ELSE '정상'
    END AS PASSWORD_STATUS,
    LENGTH(PASSWORD_HASH) AS PASSWORD_HASH_LENGTH,
    ROLE,
    TOKEN_BALANCE,
    TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT
FROM USERS
ORDER BY CREATED_AT DESC;

-- 2. 특정 사용자로 로그인 테스트 (username을 변경해서 사용)
-- SELECT 
--     USERNAME,
--     EMAIL,
--     'BCrypt 해시: ' || SUBSTR(PASSWORD_HASH, 1, 30) || '...' AS PASSWORD_PREVIEW,
--     LENGTH(PASSWORD_HASH) AS HASH_LENGTH,
--     ROLE
-- FROM USERS 
-- WHERE USERNAME = 'test_user';  -- 여기에 실제 username 입력

-- 3. 비밀번호가 NULL이거나 빈 값인 사용자 찾기
SELECT 
    USERNAME,
    EMAIL,
    '비밀번호 문제 발견' AS ISSUE
FROM USERS
WHERE PASSWORD_HASH IS NULL 
   OR LENGTH(TRIM(PASSWORD_HASH)) = 0
   OR LENGTH(PASSWORD_HASH) < 20;

-- 4. 애플리케이션에서 사용할 수 있는 사용자 목록
SELECT 
    USERNAME,
    EMAIL,
    ROLE,
    TOKEN_BALANCE
FROM USERS
WHERE PASSWORD_HASH IS NOT NULL
  AND LENGTH(PASSWORD_HASH) >= 20
ORDER BY USERNAME;

