package hyun.auth.controller;

import hyun.db.entity.User;
import hyun.db.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserRepository userRepository;

    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증이 필요합니다.");
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("tokenBalance", user.getTokenBalance());
        userInfo.put("role", user.getRole());
        
        return ResponseEntity.ok(userInfo);
    }

    /**
     * 토큰 보유 순위 조회 (상위 10명)
     */
    @GetMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> getTokenRanking() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "tokenBalance"));
        
        List<Map<String, Object>> ranking = users.stream()
            .limit(10)
            .map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("username", user.getUsername());
                userData.put("tokens", user.getTokenBalance());
                return userData;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ranking);
    }
}

