# BetSettlement 테이블 저장 예시

## 정산 프로세스 개요

1. **스케줄러 실행**: `BetSettlementScheduler`가 1분마다 마감된 내기를 체크
2. **투표 집계**: `Bet` 테이블의 `votesForA`와 `votesForB` 비교
3. **승리 옵션 결정**: 더 많은 투표를 받은 옵션이 승리 (동점 시 A 승리)
4. **정산 기록 저장**: `BetSettlement` 테이블에 정산 결과 저장

---

## 예시 시나리오

### 1. 내기 생성 시점 (투표 마감 전)

**BETS 테이블:**
```
ID: 1
POST_ID: 100
BETTOR_A_ID: 10 (사용자: "홍길동")
BETTOR_B_ID: 20 (사용자: "김철수")
BET_TITLE: "이번 주말에 누가 더 많이 승리할까?"
OPTION_A: "홍길동"
OPTION_B: "김철수"
DEADLINE: 2024-01-15 23:59:59
TOTAL_VOTES: 5
VOTES_FOR_A: 3
VOTES_FOR_B: 2
BET_AMOUNT: 100
CREATED_AT: 2024-01-08 10:00:00
```

**BET_VOTES 테이블 (투표 기록):**
```
ID | BET_ID | USER_ID | SELECTED_OPTION | CREATED_AT
---|--------|---------|-----------------|-------------------
1  | 1      | 30      | A               | 2024-01-08 11:00:00
2  | 1      | 40      | A               | 2024-01-08 12:00:00
3  | 1      | 50      | A               | 2024-01-08 13:00:00
4  | 1      | 60      | B               | 2024-01-08 14:00:00
5  | 1      | 70      | B               | 2024-01-08 15:00:00
```

**BET_SETTLEMENTS 테이블:**
```
(아직 데이터 없음 - 마감 전이므로)
```

---

### 2. 투표 마감 후 정산 시점 (2024-01-16 00:01:00)

**스케줄러 동작:**
- `BetSettlementScheduler.checkAndSettleExpiredBets()` 실행
- `deadline` (2024-01-15 23:59:59)이 지난 Bet #1 발견
- 투표 결과 확인: `votesForA = 3`, `votesForB = 2`
- 승리 옵션 결정: **"A"** (A가 더 많음)
- `BetService.settleBet(1, "A")` 호출

**정산 처리 후 BET_SETTLEMENTS 테이블에 저장되는 데이터:**

```
ID: 1
BET_ID: 1                    ← 정산된 내기 ID (BETS 테이블 참조)
WINNER_OPTION: 'A'           ← 승리 옵션 ('A' 또는 'B')
SETTLED_AT: 2024-01-16 00:01:15  ← 정산 완료 시각
```

---

### 3. 다른 예시: B 옵션 승리

**BETS 테이블:**
```
ID: 2
POST_ID: 200
BETTOR_A_ID: 10
BETTOR_B_ID: 20
BET_TITLE: "다음 게임에서 누가 더 높은 KDA를 기록할까?"
OPTION_A: "홍길동"
OPTION_B: "김철수"
DEADLINE: 2024-01-20 23:59:59
TOTAL_VOTES: 8
VOTES_FOR_A: 2
VOTES_FOR_B: 6              ← B가 더 많음
BET_AMOUNT: 200
CREATED_AT: 2024-01-13 10:00:00
```

**정산 후 BET_SETTLEMENTS 테이블:**
```
ID: 2
BET_ID: 2
WINNER_OPTION: 'B'           ← B가 승리
SETTLED_AT: 2024-01-21 00:01:20
```

---

### 4. 동점인 경우 (A 옵션 승리)

**BETS 테이블:**
```
ID: 3
POST_ID: 300
...
TOTAL_VOTES: 6
VOTES_FOR_A: 3
VOTES_FOR_B: 3              ← 동점
...
```

**정산 후 BET_SETTLEMENTS 테이블:**
```
ID: 3
BET_ID: 3
WINNER_OPTION: 'A'           ← 동점일 경우 A 승리 (코드 로직)
SETTLED_AT: 2024-01-22 00:01:30
```

---

## 코드에서의 저장 로직

```java
// BetService.settleBet() 메서드 (184-188줄)
BetSettlement settlement = new BetSettlement();
settlement.setBet(bet);                    // 정산된 내기 객체
settlement.setWinnerOption(winnerOption);   // "A" 또는 "B"
settlement.setSettledAt(Instant.now());    // 현재 시각
betSettlementRepository.save(settlement);  // DB에 저장
```

**승리 옵션 결정 로직** (BetSettlementScheduler 53-58줄):
```java
String winnerOption;
if (bet.getVotesForB() > bet.getVotesForA()) {
    winnerOption = "B";  // B가 더 많으면 B 승리
} else {
    winnerOption = "A";  // A가 더 많거나 동점이면 A 승리
}
```

---

## 정산 후 추가 처리

정산 기록 저장 후 다음 작업도 수행됩니다:

1. **내기 승리자 보상**: `bettorA` 또는 `bettorB`에게 `betAmount * 2` 토큰 지급
2. **투표 승리자 보상**: 승리 옵션에 투표한 사용자들에게 각각 50 토큰 지급
3. **거래 이력 기록**: `TokenTransaction` 테이블에 모든 토큰 지급 내역 저장

---

## 요약

- **BET_SETTLEMENTS 테이블**에는 마감된 내기의 **최종 정산 결과**만 저장됩니다
- 각 내기당 **1개의 레코드**만 생성됩니다 (OneToOne 관계)
- `WINNER_OPTION`은 투표 결과를 기반으로 자동 결정됩니다
- `SETTLED_AT`은 정산이 완료된 정확한 시각을 기록합니다

