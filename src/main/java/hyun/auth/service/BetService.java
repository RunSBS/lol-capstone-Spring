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
     * 내기자 둘 다 betAmount만큼 토큰을 차감
     */
    @Transactional
    public Bet createBet(Post post, User bettorA, String bettorBUsername, String betTitle, String optionA, String optionB, Instant deadline, Long betAmount) {
        // bettorB 찾기
        User bettorB = userRepository.findByUsername(bettorBUsername)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상대 사용자를 찾을 수 없습니다: " + bettorBUsername));
        
        // betAmount 기본값 처리 (null이거나 0 이하면 0으로 설정)
        long actualBetAmount = (betAmount != null && betAmount > 0) ? betAmount : 0L;
        
        // 내기자 둘 다 토큰 차감
        if (actualBetAmount > 0) {
            // bettorA 토큰 차감
            long balanceA = bettorA.getTokenBalance();
            if (balanceA < actualBetAmount) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "토큰이 부족합니다. 필요: " + actualBetAmount + ", 보유: " + balanceA);
            }
            bettorA.setTokenBalance(balanceA - actualBetAmount);
            userRepository.save(bettorA);
            
            // bettorA 거래 이력 기록
            TokenTransaction txA = new TokenTransaction();
            txA.setUser(bettorA);
            txA.setAmount(-actualBetAmount);
            txA.setBalanceBefore(balanceA);
            txA.setBalanceAfter(balanceA - actualBetAmount);
            txA.setTransactionType("BET_REWARD");
            txA.setDescription("내기 참가 - 게시글 #" + post.getId() + " (A 진영)");
            txA.setCreatedAt(LocalDateTime.now());
            tokenTransactionRepository.save(txA);
            
            // bettorB 토큰 차감
            long balanceB = bettorB.getTokenBalance();
            if (balanceB < actualBetAmount) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "상대방의 토큰이 부족합니다. 필요: " + actualBetAmount + ", 보유: " + balanceB);
            }
            bettorB.setTokenBalance(balanceB - actualBetAmount);
            userRepository.save(bettorB);
            
            // bettorB 거래 이력 기록
            TokenTransaction txB = new TokenTransaction();
            txB.setUser(bettorB);
            txB.setAmount(-actualBetAmount);
            txB.setBalanceBefore(balanceB);
            txB.setBalanceAfter(balanceB - actualBetAmount);
            txB.setTransactionType("BET_REWARD");
            txB.setDescription("내기 참가 - 게시글 #" + post.getId() + " (B 진영)");
            txB.setCreatedAt(LocalDateTime.now());
            tokenTransactionRepository.save(txB);
            
            log.info("내기자 토큰 차감 완료: bettorA={}, bettorB={}, 각각 {} 토큰 차감", 
                bettorA.getUsername(), bettorB.getUsername(), actualBetAmount);
        }
        
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
        bet.setBetAmount(actualBetAmount);
        bet.setCreatedAt(Instant.now());
        
        Bet saved = betRepository.save(bet);
        log.info("Bet 생성 완료: betId={}, postId={}, bettorA={}, bettorB={}, betAmount={}", 
            saved.getId(), post.getId(), bettorA.getUsername(), bettorB.getUsername(), actualBetAmount);
        
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
     * - 내기 승리자 (bettorA 또는 bettorB)에게 betAmount * 2 지급 (걸었던 토큰 2배)
     * - 투표 성공자 (승리 옵션에 투표한 사람들)에게 50 토큰 지급
     */
    @Transactional
    private void rewardWinners(Bet bet, String winnerOption) {
        // 1. 내기 승리자 확인 및 보상 지급
        User betWinner;
        if ("A".equals(winnerOption)) {
            betWinner = bet.getBettorA();
        } else {
            betWinner = bet.getBettorB();
        }
        
        // 내기 승리자 보상 지급 (betAmount * 2)
        long betAmount = bet.getBetAmount() != null ? bet.getBetAmount() : 0L;
        long betWinnerReward = betAmount * 2; // 걸었던 토큰의 2배
        
        if (betWinnerReward > 0) {
            long currentBalance = betWinner.getTokenBalance();
            long newBalance = currentBalance + betWinnerReward;
            betWinner.setTokenBalance(newBalance);
            userRepository.save(betWinner);
            
            // 내기 승리자 거래 이력 기록
            TokenTransaction betWinnerTx = new TokenTransaction();
            betWinnerTx.setUser(betWinner);
            betWinnerTx.setAmount(betWinnerReward);
            betWinnerTx.setBalanceBefore(currentBalance);
            betWinnerTx.setBalanceAfter(newBalance);
            betWinnerTx.setTransactionType("BET_REWARD");
            betWinnerTx.setDescription("내기 승리 보상 - 내기 #" + bet.getId() + " (" + winnerOption + " 옵션, 걸었던 토큰: " + betAmount + ")");
            betWinnerTx.setCreatedAt(LocalDateTime.now());
            tokenTransactionRepository.save(betWinnerTx);
            
            log.info("내기 승리자 토큰 지급 완료: userId={}, 걸었던 토큰={}, 지급 토큰={}, 잔액={} -> {}", 
                betWinner.getId(), betAmount, betWinnerReward, currentBalance, newBalance);
        } else {
            log.info("내기 금액이 0이므로 내기 승리자에게 보상 지급하지 않음: betId={}", bet.getId());
        }
        
        // 2. 승리 옵션에 투표한 사용자 조회
        List<BetVote> winningVotes = betVoteRepository
            .findByBetAndSelectedOption(bet, winnerOption);
        
        // 3. 투표 성공자들에게 토큰 지급 (고정 보상: 50토큰)
        long voteWinnerReward = 50L;
        int voteWinnerCount = 0;
        
        for (BetVote vote : winningVotes) {
            User user = vote.getUser();
            
            // 내기 승리자와 동일 인물인 경우 중복 지급 방지
            if (user.getId().equals(betWinner.getId())) {
                log.info("내기 승리자가 투표도 성공했으나, 이미 보상을 받았으므로 건너뜀: userId={}", user.getId());
                continue;
            }
            
            long voteUserBalance = user.getTokenBalance();
            long voteUserNewBalance = voteUserBalance + voteWinnerReward;
            
            // 토큰 지급
            user.setTokenBalance(voteUserNewBalance);
            userRepository.save(user);
            
            // 거래 이력 기록
            TokenTransaction tx = new TokenTransaction();
            tx.setUser(user);
            tx.setAmount(voteWinnerReward);
            tx.setBalanceBefore(voteUserBalance);
            tx.setBalanceAfter(voteUserNewBalance);
            tx.setTransactionType("BET_REWARD");
            tx.setDescription("투표 승리 보상 - 내기 #" + bet.getId() + " (" + winnerOption + " 옵션)");
            tx.setCreatedAt(LocalDateTime.now());
            tokenTransactionRepository.save(tx);
            
            log.info("투표 승리자 토큰 지급 완료: userId={}, 추가 토큰={}, 잔액={} -> {}", 
                user.getId(), voteWinnerReward, voteUserBalance, voteUserNewBalance);
            
            voteWinnerCount++;
        }
        
        log.info("정산 완료: betId={}, winnerOption={}, 내기승리자=1명, 투표승리자={}명, 지급 토큰=50개/인", 
            bet.getId(), winnerOption, voteWinnerCount);
    }
}

