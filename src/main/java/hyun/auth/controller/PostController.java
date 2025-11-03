package hyun.auth.controller;

import hyun.auth.dto.PostDto;
import hyun.auth.service.BetService;
import hyun.auth.service.PostReactionService;
import hyun.auth.service.PostService;
import hyun.db.entity.Bet;
import hyun.db.entity.BetVote;
import hyun.db.entity.Post;
import hyun.db.entity.User;
import hyun.db.repo.BetRepository;
import hyun.db.repo.BetVoteRepository;
import hyun.db.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {
    private final PostService postService;
    private final PostReactionService postReactionService;
    private final BetService betService;
    private final BetRepository betRepository;
    private final BetVoteRepository betVoteRepository;
    private final UserRepository userRepository;

    public record CreatePostReq(String title, String content, String category, 
                               String writerB, 
                               VoteData vote,
                               Map<String, Object> matchData,
                               Long betAmount) {
        public record VoteData(String question, String[] options, String description, 
                              Boolean hasEndTime, String endTime) {}
    }
    public record UpdatePostReq(String title, String content, String contentB) {}

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        try {
            // page와 size가 명시적으로 제공된 경우 페이징된 결과 반환
            if (page >= 0 && size > 0) {
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
                org.springframework.data.domain.Page<PostDto> postsPage = postService.findAllPaged(pageable, category);
                
                // Spring의 Page 객체를 JSON으로 변환하기 위해 Map으로 변환
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("content", postsPage.getContent());
                response.put("totalElements", postsPage.getTotalElements());
                response.put("totalPages", postsPage.getTotalPages());
                response.put("size", postsPage.getSize());
                response.put("number", postsPage.getNumber());
                response.put("numberOfElements", postsPage.getNumberOfElements());
                response.put("first", postsPage.isFirst());
                response.put("last", postsPage.isLast());
                
                log.info("Returning paginated posts: page={}, size={}, totalElements={}, totalPages={}", 
                        page, size, postsPage.getTotalElements(), postsPage.getTotalPages());
                return ResponseEntity.ok(response);
            } else {
                // 기존 방식 유지 (페이징 없이 전체 목록)
                List<PostDto> posts = postService.findAll(category);
                log.info("Returning {} posts for category: {}", posts.size(), category);
                
                // 롤문철 카테고리인 경우 vote 정보 확인
                if ("lolmuncheol".equals(category) || category == null || "all".equalsIgnoreCase(category)) {
                    try {
                        posts.stream()
                            .filter(p -> "lolmuncheol".equals(p.getCategory()))
                            .forEach(p -> {
                                try {
                                    log.info("롤문철 게시글 응답: postId={}, title={}, vote={}", 
                                        p.getId(), p.getTitle(), p.getVote() != null ? "존재" : "null");
                                    if (p.getVote() != null) {
                                        var vote = p.getVote();
                                        String optionsStr = vote.getOptions() != null 
                                            ? java.util.Arrays.toString(vote.getOptions()) 
                                            : "null";
                                        log.info("  - vote.question={}, vote.options={}, vote.results={}", 
                                            vote.getQuestion(), 
                                            optionsStr,
                                            vote.getResults());
                                    }
                                } catch (Exception e) {
                                    log.warn("롤문철 게시글 로깅 중 에러: postId={}, {}", p.getId(), e.getMessage());
                                }
                            });
                    } catch (Exception e) {
                        log.warn("롤문철 게시글 로깅 중 에러: {}", e.getMessage());
                    }
                }
                
                return ResponseEntity.ok(posts);
            }
        } catch (Exception e) {
            log.error("Error getting posts for category {}: {}", category, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody CreatePostReq req) {
        log.info("Received create post request: title={}, content={}, category={}, writerB={}, vote={}, matchData={}", 
            req.title(), req.content(), req.category(), req.writerB(), req.vote(), req.matchData());
        
        String betTitle = null;
        String optionA = null;
        String optionB = null;
        String endTime = null;
        
        if (req.vote() != null) {
            betTitle = req.vote().question();
            if (req.vote().options() != null && req.vote().options().length > 0) {
                optionA = req.vote().options()[0];
                if (req.vote().options().length > 1) {
                    optionB = req.vote().options()[1];
                }
            }
            if (req.vote().hasEndTime() != null && req.vote().hasEndTime() && req.vote().endTime() != null) {
                endTime = req.vote().endTime();
            }
        }
        
        Post post = postService.create(req.title(), req.content(), req.category(), 
                                      req.writerB(), betTitle, optionA, optionB, endTime, req.matchData(), req.betAmount());
        log.info("Created post with ID: {}, matchData included: {}, betAmount: {}", 
                post.getId(), req.matchData() != null, req.betAmount());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id) {
        try {
            log.info("게시글 조회 요청: postId={}", id);
            PostDto post = postService.findById(id);
            log.info("게시글 조회 성공: postId={}, title={}", id, post.getTitle());
            return ResponseEntity.ok(post);
        } catch (ResponseStatusException e) {
            log.error("게시글 조회 실패: postId={}, status={}, message={}", id, e.getStatusCode(), e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("게시글 조회 중 예상치 못한 오류: postId={}, error={}", id, e.getMessage(), e);
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 조회 중 오류가 발생했습니다: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody UpdatePostReq req) {
        log.info("게시글 수정 요청: postId={}, title={}, content={}, contentB={}", 
                 id, req.title() != null ? "제공됨" : "null", 
                 req.content() != null ? "제공됨" : "null", 
                 req.contentB() != null ? "제공됨" : "null");
        try {
            Post post = postService.update(id, req.title(), req.content(), req.contentB());
            log.info("게시글 수정 성공: postId={}", id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("게시글 수정 실패: postId={}, error={}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok(Map.of("message", "게시글 삭제 성공"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, String>> likePost(@PathVariable Long id) {
        postReactionService.likePost(id);
        return ResponseEntity.ok(Map.of("message", "좋아요 성공"));
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<Map<String, String>> dislikePost(@PathVariable Long id) {
        postReactionService.dislikePost(id);
        return ResponseEntity.ok(Map.of("message", "싫어요 성공"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Map<String, String>> removeLike(@PathVariable Long id) {
        postReactionService.removeLikePost(id);
        return ResponseEntity.ok(Map.of("message", "좋아요 취소 성공"));
    }

    @DeleteMapping("/{id}/dislike")
    public ResponseEntity<Map<String, String>> removeDislike(@PathVariable Long id) {
        postReactionService.removeDislikePost(id);
        return ResponseEntity.ok(Map.of("message", "싫어요 취소 성공"));
    }

    /**
     * 투표하기 (롤문철 게시글)
     * optionIndex: 0 = 옵션 A, 1 = 옵션 B
     */
    @PostMapping("/{postId}/vote")
    public ResponseEntity<Map<String, String>> voteOnPost(
            @PathVariable Long postId,
            @RequestParam Integer optionIndex) {
        
        log.info("투표 요청: postId={}, optionIndex={}", postId, optionIndex);
        
        // 1. Bet 조회
        Optional<Bet> betOpt = betRepository.findByPost_Id(postId);
        if (betOpt.isEmpty()) {
            log.warn("Bet을 찾을 수 없습니다: postId={}", postId);
            return ResponseEntity.badRequest().body(Map.of("error", "투표를 찾을 수 없습니다."));
        }
        Bet bet = betOpt.get();
        
        // 2. optionIndex를 "A" 또는 "B"로 변환
        String option;
        if (optionIndex == 0) {
            option = "A";
        } else if (optionIndex == 1) {
            option = "B";
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "옵션은 0 또는 1이어야 합니다."));
        }
        
        // 3. 현재 로그인한 사용자 조회
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 4. 투표 처리
        try {
            betService.vote(bet.getId(), user.getId(), option);
            log.info("투표 완료: postId={}, userId={}, option={}", postId, user.getId(), option);
            return ResponseEntity.ok(Map.of("message", "투표 완료"));
        } catch (Exception e) {
            log.error("투표 실패: postId={}, optionIndex={}", postId, optionIndex, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 투표 취소
     */
    @DeleteMapping("/{postId}/vote")
    public ResponseEntity<Map<String, String>> removeVote(@PathVariable Long postId) {
        
        log.info("투표 취소 요청: postId={}", postId);
        
        // 1. Bet 조회
        Optional<Bet> betOpt = betRepository.findByPost_Id(postId);
        if (betOpt.isEmpty()) {
            log.warn("Bet을 찾을 수 없습니다: postId={}", postId);
            return ResponseEntity.badRequest().body(Map.of("error", "투표를 찾을 수 없습니다."));
        }
        Bet bet = betOpt.get();
        
        // 2. 현재 로그인한 사용자 조회
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 3. 투표 기록 조회 및 삭제
        Optional<BetVote> voteOpt = betVoteRepository.findByBetAndUser(bet, user);
        if (voteOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "투표한 기록이 없습니다."));
        }
        
        BetVote vote = voteOpt.get();
        String selectedOption = vote.getSelectedOption();
        
        // 4. 투표 기록 삭제
        betVoteRepository.delete(vote);
        
        // 5. Bet의 투표 수 업데이트
        bet.setTotalVotes(bet.getTotalVotes() - 1);
        if ("A".equals(selectedOption)) {
            bet.setVotesForA(bet.getVotesForA() - 1);
        } else {
            bet.setVotesForB(bet.getVotesForB() - 1);
        }
        betRepository.save(bet);
        
        log.info("투표 취소 완료: postId={}, userId={}, option={}", postId, user.getId(), selectedOption);
        return ResponseEntity.ok(Map.of("message", "투표 취소 완료"));
    }

    /**
     * 투표 결과 및 사용자 투표 정보 조회
     */
    @GetMapping("/{postId}/vote")
    public ResponseEntity<Map<String, Object>> getVoteResults(@PathVariable Long postId) {
        
        log.info("투표 결과 조회: postId={}", postId);
        
        // 1. Bet 조회
        Optional<Bet> betOpt = betRepository.findByPost_Id(postId);
        if (betOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "voteData", null,
                "userVote", null
            ));
        }
        Bet bet = betOpt.get();
        
        // 2. 투표 결과 구성
        Map<Integer, Integer> results = new HashMap<>();
        results.put(0, bet.getVotesForA() != null ? bet.getVotesForA().intValue() : 0);
        results.put(1, bet.getVotesForB() != null ? bet.getVotesForB().intValue() : 0);
        
        Map<String, Object> voteData = new HashMap<>();
        voteData.put("question", bet.getBetTitle() != null ? bet.getBetTitle() : "");
        voteData.put("options", new String[]{
            bet.getOptionA() != null ? bet.getOptionA() : "",
            bet.getOptionB() != null ? bet.getOptionB() : ""
        });
        voteData.put("results", results);
        voteData.put("endTime", bet.getDeadline() != null ? bet.getDeadline().toString() : null);
        
        // 3. 현재 로그인한 사용자의 투표 정보 조회
        Integer userVote = null;
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (username != null && !username.equals("anonymousUser")) {
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    Optional<BetVote> voteOpt = betVoteRepository.findByBetAndUser(bet, user);
                    if (voteOpt.isPresent()) {
                        String selectedOption = voteOpt.get().getSelectedOption();
                        userVote = "A".equals(selectedOption) ? 0 : 1;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("사용자 투표 정보 조회 실패: {}", e.getMessage());
        }
        
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("voteData", voteData);
        responseMap.put("userVote", userVote);
        return ResponseEntity.ok(responseMap);
    }
}

