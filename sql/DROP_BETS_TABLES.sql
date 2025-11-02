-- ============================================
-- 내기(Bet) 관련 테이블 삭제 SQL (Oracle)
-- Oracle Cloud ADB에서 실행
-- 주의: 이 스크립트는 모든 내기 관련 데이터를 삭제합니다
-- ============================================

-- 외래키 제약조건 때문에 순서가 중요합니다
-- 먼저 자식 테이블을 삭제하고, 그 다음 부모 테이블을 삭제합니다

-- 1. BET_SETTLEMENTS 테이블 삭제
DROP TABLE BET_SETTLEMENTS CASCADE CONSTRAINTS;

-- 2. BET_VOTES 테이블 삭제
DROP TABLE BET_VOTES CASCADE CONSTRAINTS;

-- 3. BETS 테이블 삭제
DROP TABLE BETS CASCADE CONSTRAINTS;

-- 4. 시퀀스 삭제
DROP SEQUENCE BET_SETTLEMENTS_SEQ;
DROP SEQUENCE BET_VOTES_SEQ;
DROP SEQUENCE BETS_SEQ;

-- 확인
SELECT 'Bets tables dropped successfully' AS STATUS FROM DUAL;

