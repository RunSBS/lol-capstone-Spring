package hyun.auth.controller;

import hyun.auth.service.BetService;
import hyun.db.entity.Bet;
import hyun.db.entity.BetSettlement;
import hyun.db.entity.User;
import hyun.db.repo.BetSettlementRepository;
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
}

