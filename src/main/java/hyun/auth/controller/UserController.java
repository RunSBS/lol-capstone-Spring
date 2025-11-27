package hyun.auth.controller;

import hyun.db.entity.User;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
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
        userInfo.put("bio", user.getBio() != null ? user.getBio() : "");
        userInfo.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        userInfo.put("tier", user.getTier() != null ? user.getTier() : "");
        userInfo.put("mainChampion", user.getMainChampion() != null ? user.getMainChampion() : "");
        
        return ResponseEntity.ok(userInfo);
    }

    /**
     * 프로필 업데이트 (소개글, 프로필 이미지)
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증이 필요합니다.");
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        // 소개글 업데이트
        if (request.containsKey("bio")) {
            String bio = (String) request.get("bio");
            user.setBio(bio != null && !bio.trim().isEmpty() ? bio : null);
            log.info("프로필 소개글 업데이트: userId={}, bio={}", user.getId(), bio);
        }
        
        // 프로필 이미지 URL 업데이트
        if (request.containsKey("avatarUrl")) {
            String avatarUrl = (String) request.get("avatarUrl");
            user.setAvatarUrl(avatarUrl != null && !avatarUrl.trim().isEmpty() ? avatarUrl : null);
            log.info("프로필 이미지 업데이트: userId={}, avatarUrl={}", user.getId(), avatarUrl);
        }
        
        // 티어 업데이트
        if (request.containsKey("tier")) {
            String tier = (String) request.get("tier");
            user.setTier(tier != null && !tier.trim().isEmpty() ? tier : null);
            log.info("프로필 티어 업데이트: userId={}, tier={}", user.getId(), tier);
        }
        
        // 주 챔피언 업데이트
        if (request.containsKey("mainChampion")) {
            String mainChampion = (String) request.get("mainChampion");
            user.setMainChampion(mainChampion != null && !mainChampion.trim().isEmpty() ? mainChampion : null);
            log.info("프로필 주 챔피언 업데이트: userId={}, mainChampion={}", user.getId(), mainChampion);
        }
        
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "프로필이 업데이트되었습니다.");
        response.put("bio", user.getBio());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("tier", user.getTier());
        response.put("mainChampion", user.getMainChampion());
        
        return ResponseEntity.ok(response);
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

