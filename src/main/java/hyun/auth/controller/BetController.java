package hyun.auth.controller;

import hyun.auth.service.BetService;
import hyun.db.entity.Bet;
import hyun.db.entity.BetSettlement;
import hyun.db.entity.BetVote;
import hyun.db.entity.User;
import hyun.db.repo.BetRepository;
import hyun.db.repo.BetSettlementRepository;
import hyun.db.repo.BetVoteRepository;
import hyun.db.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bet")
@RequiredArgsConstructor
public class BetController {
    private final BetService betService;
    private final UserRepository userRepository;
    private final BetSettlementRepository betSettlementRepository;
    private final BetRepository betRepository;
    private final BetVoteRepository betVoteRepository;

    /**
     * 투표하기
     */
    @PostMapping("/{betId}/vote")
    public ResponseEntity<String> vote(
            @PathVariable Long betId,
            @RequestParam String option) {  // "A" or "B"
        
        // 현재 로그인한 사용자 조회
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        betService.vote(betId, user.getId(), option);
        return ResponseEntity.ok("투표 완료");
    }
    
    /**
     * 정산하기 (관리자용)
     */
    @PostMapping("/{betId}/settle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> settle(
            @PathVariable Long betId,
            @RequestParam String winnerOption) {  // "A" or "B"
        
        betService.settleBet(betId, winnerOption);
        return ResponseEntity.ok("정산 완료");
    }
    
    /**
     * 사용자가 투표한 내기 중 정산 완료된 것 조회
     * @param since 이 시각 이후 정산된 것만 조회 (ISO 8601 형식, 예: "2024-01-15T10:00:00Z")
     */
    @GetMapping("/settled")
    public ResponseEntity<List<Map<String, Object>>> getSettledBets(
            @RequestParam(required = false) String since) {
        
        // 현재 로그인한 사용자 조회
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // since 파라미터 파싱 (없으면 1시간 전부터)
        Instant sinceInstant = since != null 
            ? Instant.parse(since) 
            : Instant.now().minusSeconds(3600);
        
        System.out.println("[BetController] 정산 완료 내기 조회 요청 - userId: " + user.getId() + ", since: " + sinceInstant);
        
        List<Bet> settledBets = betService.getSettledBetsByUserVote(user.getId(), sinceInstant);
        
        System.out.println("[BetController] 조회된 정산 완료 내기 수: " + settledBets.size());
        
        // 응답 형식 변환
        List<Map<String, Object>> result = settledBets.stream()
            .map(bet -> {
                Map<String, Object> map = new HashMap<>();
                map.put("betId", bet.getId());
                map.put("betTitle", bet.getBetTitle());
                map.put("optionA", bet.getOptionA());
                map.put("optionB", bet.getOptionB());
                map.put("postId", bet.getPost().getId());
                
                // 정산 정보 조회
                BetSettlement settlement = betSettlementRepository.findByBet(bet)
                    .orElse(null);
                if (settlement != null) {
                    map.put("winnerOption", settlement.getWinnerOption());
                    map.put("settledAt", settlement.getSettledAt().toString());
                }
                
                return map;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 투표 참여 유저들의 티어 분포도 조회
     * 마감된 내기만 조회 가능
     */
    @GetMapping("/{betId}/tier-distribution")
    public ResponseEntity<Map<String, Object>> getTierDistribution(@PathVariable Long betId) {
        Bet bet = betRepository.findById(betId)
            .orElseThrow(() -> new RuntimeException("내기를 찾을 수 없습니다."));
        
        // 마감 여부 확인
        boolean isClosed = Instant.now().isAfter(bet.getDeadline());
        if (!isClosed) {
            return ResponseEntity.badRequest().body(Map.of("error", "아직 마감되지 않은 내기입니다."));
        }
        
        // 투표 목록 조회
        List<BetVote> votes = betVoteRepository.findByBet(bet);
        
        // 티어별 집계
        Map<String, Long> tierCount = new HashMap<>();
        long totalVotes = votes.size();
        long votesWithTier = 0;
        
        for (BetVote vote : votes) {
            User user = vote.getUser();
            String tier = user.getTier();
            if (tier != null && !tier.trim().isEmpty()) {
                tierCount.put(tier, tierCount.getOrDefault(tier, 0L) + 1);
                votesWithTier++;
            }
        }
        
        // 응답 데이터 구성
        Map<String, Object> result = new HashMap<>();
        result.put("totalVotes", totalVotes);
        result.put("votesWithTier", votesWithTier);
        result.put("tierDistribution", tierCount);
        
        // 티어별 비율 계산
        Map<String, Double> tierPercentage = new HashMap<>();
        if (votesWithTier > 0) {
            for (Map.Entry<String, Long> entry : tierCount.entrySet()) {
                double percentage = (entry.getValue() * 100.0) / votesWithTier;
                tierPercentage.put(entry.getKey(), Math.round(percentage * 10.0) / 10.0);
            }
        }
        result.put("tierPercentage", tierPercentage);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 승리자를 맞춘 유저 통계 조회
     * 정산이 완료된 내기만 조회 가능
     */
    @GetMapping("/{betId}/winner-stats")
    public ResponseEntity<Map<String, Object>> getWinnerStats(@PathVariable Long betId) {
        Bet bet = betRepository.findById(betId)
            .orElseThrow(() -> new RuntimeException("내기를 찾을 수 없습니다."));
        
        // 정산 정보 확인
        BetSettlement settlement = betSettlementRepository.findByBet(bet)
            .orElse(null);
        
        if (settlement == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "아직 정산되지 않은 내기입니다."));
        }
        
        String winnerOption = settlement.getWinnerOption();
        
        // 전체 투표 목록 조회
        List<BetVote> allVotes = betVoteRepository.findByBet(bet);
        
        // 승리 옵션에 투표한 유저 목록
        List<BetVote> winningVotes = betVoteRepository.findByBetAndSelectedOption(bet, winnerOption);
        
        // 통계 계산
        long totalVotes = allVotes.size();
        long correctVotes = winningVotes.size();
        long incorrectVotes = totalVotes - correctVotes;
        
        double correctPercentage = totalVotes > 0 ? (correctVotes * 100.0) / totalVotes : 0.0;
        double incorrectPercentage = totalVotes > 0 ? (incorrectVotes * 100.0) / totalVotes : 0.0;
        
        // 응답 데이터 구성
        Map<String, Object> result = new HashMap<>();
        result.put("totalVotes", totalVotes);
        result.put("correctVotes", correctVotes);
        result.put("incorrectVotes", incorrectVotes);
        result.put("correctPercentage", Math.round(correctPercentage * 10.0) / 10.0);
        result.put("incorrectPercentage", Math.round(incorrectPercentage * 10.0) / 10.0);
        result.put("winnerOption", winnerOption);
        
        return ResponseEntity.ok(result);
    }
}

