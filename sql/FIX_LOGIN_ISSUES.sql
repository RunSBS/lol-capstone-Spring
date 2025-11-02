-- ============================================
-- 로그인 문제 해결 스크립트
-- ============================================

-- 1. USERS 테이블이 없다면 재생성이 필요하지만, 
--    여기서는 데이터가 있는지 확인하고 문제 해결만 시도

-- 2. BETS 테이블의 외래키가 문제를 일으키는 경우, 일시적으로 비활성화
--    (주의: 실제로는 외래키를 제거하지 않고 문제 원인을 찾아야 함)

-- 3. USERS 테이블의 제약조건 확인
SELECT 
    'USERS 테이블 제약조건' AS CHECK_TYPE,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    STATUS
FROM USER_CONSTRAINTS
WHERE TABLE_NAME = 'USERS'
ORDER BY CONSTRAINT_TYPE;

-- 4. USERS 테이블에 문제가 있다면 아래 주석을 해제하여 실행
-- ALTER TABLE USERS ENABLE CONSTRAINT [제약조건명];

-- 5. BETS 관련 외래키가 문제라면 일시적으로 제거 (주의: 데이터 무결성 문제 발생 가능)
-- BEGIN
--     BEGIN
--         EXECUTE IMMEDIATE 'ALTER TABLE BETS DROP CONSTRAINT FK_BETS_BETTOR_A';
--     EXCEPTION
--         WHEN OTHERS THEN NULL;
--     END;
--     
--     BEGIN
--         EXECUTE IMMEDIATE 'ALTER TABLE BETS DROP CONSTRAINT FK_BETS_BETTOR_B';
--     EXCEPTION
--         WHEN OTHERS THEN NULL;
--     END;
-- END;
-- /

-- 6. 실제 사용자 데이터 확인
SELECT 
    '사용자 데이터 상세 확인' AS CHECK_TYPE,
    ID,
    USERNAME,
    EMAIL,
    CASE 
        WHEN PASSWORD_HASH IS NULL THEN 'NULL'
        WHEN LENGTH(PASSWORD_HASH) = 0 THEN '빈 문자열'
        ELSE '존재함 (' || LENGTH(PASSWORD_HASH) || '자)'
    END AS PASSWORD_HASH_STATUS,
    CASE 
        WHEN PASSWORD IS NULL THEN 'NULL'
        WHEN LENGTH(PASSWORD) = 0 THEN '빈 문자열'
        ELSE '존재함 (' || LENGTH(PASSWORD) || '자)'
    END AS PASSWORD_FIELD_STATUS,
    ROLE,
    TOKEN_BALANCE,
    CREATED_AT
FROM USERS
ORDER BY CREATED_AT DESC;

-- 7. 특정 사용자로 로그인 테스트를 위한 정보 확인
-- (실제 username을 넣어서 확인)
-- SELECT 
--     USERNAME,
--     LENGTH(PASSWORD_HASH) AS PASSWORD_LENGTH,
--     SUBSTR(PASSWORD_HASH, 1, 20) || '...' AS PASSWORD_PREVIEW,
--     ROLE
-- FROM USERS 
-- WHERE USERNAME = 'your_username_here';

-- 8. 애플리케이션 재시작 권장 메시지
SELECT '로그인 문제 해결을 위해 애플리케이션을 재시작하세요' AS MESSAGE FROM DUAL;
SELECT '브라우저 개발자 도구(F12) > Network 탭에서 /auth/login 요청을 확인하세요' AS DEBUG_TIP FROM DUAL;

