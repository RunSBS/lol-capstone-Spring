-- ============================================
-- BETS 테이블에 BET_AMOUNT 컬럼 추가
-- ============================================

-- BET_AMOUNT 컬럼 추가 (각 내기자가 걸 토큰 수)
ALTER TABLE BETS ADD BET_AMOUNT NUMBER DEFAULT 0 NOT NULL;

-- 확인 쿼리
SELECT COLUMN_NAME, DATA_TYPE, DATA_DEFAULT, NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'BETS' AND COLUMN_NAME = 'BET_AMOUNT';