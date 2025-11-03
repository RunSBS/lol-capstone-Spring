package hyun.auth.service;

import hyun.db.entity.Bet;
import hyun.db.repo.BetRepository;
import hyun.db.repo.BetSettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * 내기 자동 정산 스케줄러
 * 마감 시간이 지난 내기를 자동으로 정산
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BetSettlementScheduler {
    private final BetRepository betRepository;
    private final BetSettlementRepository betSettlementRepository;
    private final BetService betService;

    /**
     * 1분마다 마감된 내기를 체크하여 자동 정산
     */
    @Scheduled(fixedRate = 60000) // 1분 = 60,000ms
    @Transactional
    public void checkAndSettleExpiredBets() {
        try {
            Instant now = Instant.now();
            List<Bet> expiredBets = betRepository.findExpiredUnsettledBets(now);
            
            if (expiredBets.isEmpty()) {
                return; // 마감된 내기가 없음
            }
            
            log.info("마감된 내기 발견: {}개", expiredBets.size());
            
            for (Bet bet : expiredBets) {
                try {
                    // 이미 정산되었는지 다시 확인 (동시성 문제 방지)
                    if (betSettlementRepository.findByBet(bet).isPresent()) {
                        log.debug("이미 정산된 내기 건너뜀: betId={}", bet.getId());
                        continue;
                    }
                    
                    // 투표 결과를 기반으로 승리 옵션 결정
                    // 더 많은 투표를 받은 옵션이 승리 (동점일 경우 A 옵션 승리)
                    String winnerOption;
                    if (bet.getVotesForB() > bet.getVotesForA()) {
                        winnerOption = "B";
                    } else {
                        winnerOption = "A"; // A가 더 많거나 동점인 경우
                    }
                    
                    log.info("자동 정산 시작: betId={}, deadline={}, winnerOption={}, votesA={}, votesB={}", 
                        bet.getId(), bet.getDeadline(), winnerOption, bet.getVotesForA(), bet.getVotesForB());
                    
                    // 정산 수행
                    betService.settleBet(bet.getId(), winnerOption);
                    
                    log.info("자동 정산 완료: betId={}, winnerOption={}", bet.getId(), winnerOption);
                } catch (Exception e) {
                    log.error("자동 정산 실패: betId={}, error={}", bet.getId(), e.getMessage(), e);
                    // 하나 실패해도 다른 내기는 정산 계속 진행
                }
            }
        } catch (Exception e) {
            log.error("마감된 내기 체크 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}

