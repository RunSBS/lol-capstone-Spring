package hyun.auth.controller;

import hyun.auth.service.BetService;
import hyun.db.entity.User;
import hyun.db.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bet")
@RequiredArgsConstructor
public class BetController {
    private final BetService betService;
    private final UserRepository userRepository;

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
}

