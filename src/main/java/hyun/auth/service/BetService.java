package hyun.auth.service;

import hyun.db.entity.Bet;
import hyun.db.entity.BetSettlement;
import hyun.db.entity.BetVote;
import hyun.db.entity.Post;
import hyun.db.entity.TokenTransaction;
import hyun.db.entity.User;
import hyun.db.repo.BetRepository;
import hyun.db.repo.BetSettlementRepository;
import hyun.db.repo.BetVoteRepository;
import hyun.db.repo.TokenTransactionRepository;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BetService {
    private final BetRepository betRepository;
    private final BetVoteRepository betVoteRepository;
    private final BetSettlementRepository betSettlementRepository;
    private final UserRepository userRepository;
    private final TokenTransactionRepository tokenTransactionRepository;

    /**
     * Bet 생성 (롤문철 게시글 작성 시 자동 생성)
     */
    @Transactional
    public Bet createBet(Post post, User bettorA, String bettorBUsername, String betTitle, String optionA, String optionB, Instant deadline) {
        // bettorB 찾기
        User bettorB = userRepository.findByUsername(bettorBUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상대 사용자를 찾을 수 없습니다: " + bettorBUsername));
        
        // Bet 생성
        Bet bet = new Bet();
        bet.setPost(post);
        bet.setBettorA(bettorA);
        bet.setBettorB(bettorB);
        bet.setBetTitle(betTitle != null ? betTitle : "누가 이길까요?");
        bet.setOptionA(optionA != null ? optionA : "사용자A");
        bet.setOptionB(optionB != null ? optionB : "사용자B");
        bet.setDeadline(deadline != null ? deadline : Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 기본값: 7일 후
        bet.setTotalVotes(0L);
        bet.setVotesForA(0L);
        bet.setVotesForB(0L);
        bet.setCreatedAt(Instant.now());
        
        Bet saved = betRepository.save(bet);
        log.info("Bet 생성 완료: betId={}, postId={}, bettorA={}, bettorB={}", 
            saved.getId(), post.getId(), bettorA.getUsername(), bettorB.getUsername());
        
        return saved;
    }

    /**
     * 투표하기
     */
    @Transactional
    public void vote(Long betId, Long userId, String option) {
        // 1. 내기 조회
        Bet bet = betRepository.findById(betId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "내기를 찾을 수 없습니다."));
        
        // 2. 마감 시간 확인
        if (Instant.now().isAfter(bet.getDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "투표가 마감되었습니다.");
        }
        
        // 3. 중복 투표 확인
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        if (betVoteRepository.existsByBetAndUser(bet, user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 투표하셨습니다.");
        }
        
        // 4. 옵션 유효성 확인
        if (!"A".equals(option) && !"B".equals(option)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "옵션은 'A' 또는 'B'여야 합니다.");
        }
        
        // 5. 투표 기록 저장
        BetVote vote = new BetVote();
        vote.setBet(bet);
        vote.setUser(user);
        vote.setSelectedOption(option);
        vote.setCreatedAt(Instant.now());
        betVoteRepository.save(vote);
        
        // 6. Bet의 투표 수 업데이트
        bet.setTotalVotes(bet.getTotalVotes() + 1);
        if ("A".equals(option)) {
            bet.setVotesForA(bet.getVotesForA() + 1);
        } else {
            bet.setVotesForB(bet.getVotesForB() + 1);
        }
        betRepository.save(bet);
        
        log.info("투표 완료: betId={}, userId={}, option={}, 총투표={}, A={}, B={}", 
            betId, userId, option, bet.getTotalVotes(), bet.getVotesForA(), bet.getVotesForB());
    }
    
    /**
     * 정산하기 (마감 후 관리자가 호출)
     */
    @Transactional
    public void settleBet(Long betId, String winnerOption) {
        // 1. 내기 조회
        Bet bet = betRepository.findById(betId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "내기를 찾을 수 없습니다."));
        
        // 2. 옵션 유효성 확인
        if (!"A".equals(winnerOption) && !"B".equals(winnerOption)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "승리 옵션은 'A' 또는 'B'여야 합니다.");
        }
        
        // 3. 이미 정산되었는지 확인
        if (betSettlementRepository.findByBet(bet).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 정산된 내기입니다.");
        }
        
        // 4. 정산 기록 저장
        BetSettlement settlement = new BetSettlement();
        settlement.setBet(bet);
        settlement.setWinnerOption(winnerOption);
        settlement.setSettledAt(Instant.now());
        betSettlementRepository.save(settlement);
        
        // 5. 승리자들에게 토큰 지급
        rewardWinners(bet, winnerOption);
        
        log.info("정산 완료: betId={}, winnerOption={}", betId, winnerOption);
    }
    
    /**
     * 승리자에게 토큰 지급
     */
    @Transactional
    private void rewardWinners(Bet bet, String winnerOption) {
        // 1. 승리 옵션에 투표한 사용자 조회
        List<BetVote> winningVotes = betVoteRepository
            .findByBetAndSelectedOption(bet, winnerOption);
        
        if (winningVotes.isEmpty()) {
            log.info("승리자가 없습니다. betId: {}", bet.getId());
            return;
        }
        
        // 2. 토큰 지급량 계산 (고정 보상: 승리자당 50토큰)
        long rewardPerWinner = 50L;
        
        // 3. 각 승리자에게 토큰 지급
        for (BetVote vote : winningVotes) {
            User user = vote.getUser();
            long currentBalance = user.getTokenBalance();
            long newBalance = currentBalance + rewardPerWinner;
            
            // 토큰 지급
            user.setTokenBalance(newBalance);
            userRepository.save(user);
            
            // 거래 이력 기록
            TokenTransaction tx = new TokenTransaction();
            tx.setUser(user);
            tx.setAmount(rewardPerWinner);
            tx.setBalanceBefore(currentBalance);
            tx.setBalanceAfter(newBalance);
            tx.setTransactionType("BET_REWARD");
            tx.setDescription("투표 승리 보상 - 내기 #" + bet.getId() + " (" + winnerOption + " 옵션)");
            tx.setCreatedAt(LocalDateTime.now());
            tokenTransactionRepository.save(tx);
            
            log.info("토큰 지급 완료: userId={}, 추가 토큰={}, 잔액={} -> {}", 
                user.getId(), rewardPerWinner, currentBalance, newBalance);
        }
        
        log.info("정산 완료: betId={}, winnerOption={}, 승리자={}명, 지급 토큰={}개/인", 
            bet.getId(), winnerOption, winningVotes.size(), rewardPerWinner);
    }
}

