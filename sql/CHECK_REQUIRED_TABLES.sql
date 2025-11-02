-- ============================================
-- BETS 테이블 생성 전 필수 테이블 확인
-- ============================================

-- POSTS 테이블 확인
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'POSTS 테이블 존재'
        ELSE 'POSTS 테이블 없음 - 먼저 생성 필요'
    END AS POSTS_STATUS,
    COUNT(*) AS POSTS_COUNT
FROM USER_TABLES 
WHERE TABLE_NAME = 'POSTS';

-- USERS 테이블 확인
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'USERS 테이블 존재'
        ELSE 'USERS 테이블 없음 - 먼저 생성 필요'
    END AS USERS_STATUS,
    COUNT(*) AS USERS_COUNT
FROM USER_TABLES 
WHERE TABLE_NAME = 'USERS';

-- 전체 테이블 목록
SELECT TABLE_NAME 
FROM USER_TABLES 
ORDER BY TABLE_NAME;

