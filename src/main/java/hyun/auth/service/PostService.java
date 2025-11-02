package hyun.auth.service;

import hyun.auth.dto.PostDto;
import hyun.db.entity.Post;
import hyun.db.entity.PostReaction;
import hyun.db.entity.User;
import hyun.db.repo.PostReactionRepository;
import hyun.db.repo.PostRepository;
import hyun.db.repo.UserRepository;
import hyun.auth.service.BetService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;
    private final PostReactionRepository reactions;
    private final BetService betService;

    private User me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            log.error("No authentication found");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        }
        log.info("Authentication: {}, Principal: {}", auth.getName(), auth.getPrincipal());
        String username = auth.getName(); // Principal이 아닌 getName() 사용
        log.info("Username from auth: {}", username);
        User user = users.findByUsername(username).orElseThrow();
        log.info("Found user: {}", user.getUsername());
        return user;
    }

    @Transactional
    public Post create(String title, String content, String category, String writerB, 
                      String betTitle, String optionA, String optionB, String endTime) {
        User u = me();
        log.info("Creating post for user: {}, category: {}", u.getUsername(), category);
        Post p = new Post();
        p.setUser(u);
        p.setUserId(u.getId()); // USER_ID 컬럼도 설정
        p.setTitle(title);
        p.setContent(content);
        p.setCategory(category != null ? category : "free"); // 기본값 free
        p.setCreatedAt(Instant.now());
        log.info("Post object before save: user={}, userId={}, title={}, category={}", p.getUser().getUsername(), p.getUserId(), p.getTitle(), p.getCategory());
        Post saved = posts.save(p);
        log.info("Post saved with ID: {}, author: {}", saved.getId(), saved.getUser().getUsername());
        
        // 롤문철 카테고리일 때 자동으로 Bet 생성
        if ("lolmuncheol".equals(category)) {
            try {
                // deadline 파싱 (endTime이 있으면 사용, 없으면 기본값)
                Instant deadline = null;
                if (endTime != null && !endTime.isEmpty()) {
                    try {
                        // datetime-local 형식 파싱 (예: "2024-01-01T12:00")
                        String timeStr = endTime.trim();
                        // LocalDateTime.parse()는 ISO_LOCAL_DATE_TIME 형식을 기본으로 사용
                        // "YYYY-MM-DDTHH:mm" 또는 "YYYY-MM-DDTHH:mm:ss" 형식 지원
                        deadline = LocalDateTime.parse(timeStr).atZone(ZoneId.systemDefault()).toInstant();
                        log.info("endTime 파싱 성공: {} -> {}", endTime, deadline);
                    } catch (Exception e) {
                        log.warn("endTime 파싱 실패: {}, 기본값 사용", endTime, e);
                    }
                }
                
                // Bet 생성
                betService.createBet(
                    saved,
                    u,
                    writerB != null ? writerB : u.getUsername(), // writerB가 없으면 작성자로 설정
                    betTitle,
                    optionA,
                    optionB,
                    deadline
                );
                log.info("Bet 자동 생성 완료: postId={}", saved.getId());
            } catch (Exception e) {
                log.error("Bet 생성 실패: postId={}, error={}", saved.getId(), e.getMessage(), e);
                // Bet 생성 실패해도 Post는 생성됨 (롤백하지 않음)
            }
        }
        
        return saved;
    }

    @Transactional
    public Post update(Long postId, String title, String content) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        if (!p.getUser().getId().equals(u.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 수정 가능");
        p.setTitle(title);
        p.setContent(content);
        p.setUpdatedAt(Instant.now());
        return posts.save(p);
    }

    @Transactional
    public void delete(Long postId) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        if (!p.getUser().getId().equals(u.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제 가능");
        posts.delete(p);
    }

    @Transactional(readOnly = true)
    public PostDto findById(Long id) {
        Post p = posts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음"));
        
        // 좋아요/싫어요 개수 가져오기
        int likeCount = 0;
        int dislikeCount = 0;
        var reactionOpt = reactions.findByPost_Id(id);
        if (reactionOpt.isPresent()) {
            PostReaction reaction = reactionOpt.get();
            likeCount = reaction.getLikes().intValue();
            dislikeCount = reaction.getDislikes().intValue();
        }
        
        return new PostDto(
                p.getId(),
                p.getUserId(),
                p.getUser().getUsername(),
                p.getTitle(),
                p.getContent(),
                p.getCategory(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                likeCount,
                dislikeCount
        );
    }

    @Transactional(readOnly = true)
    public List<PostDto> findAll(String category) {
        // category가 "all"이거나 null이면 모든 게시글 반환
        List<Post> postList;
        if (category == null || category.isEmpty() || "all".equalsIgnoreCase(category)) {
            postList = posts.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        } else {
            // 특정 카테고리 필터링
            postList = posts.findAll().stream()
                    .filter(p -> category.equals(p.getCategory()))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }
        
        return postList.stream()
                .map(p -> {
                    // 좋아요/싫어요 개수 가져오기
                    int likeCount = 0;
                    int dislikeCount = 0;
                    var reactionOpt = reactions.findByPost_Id(p.getId());
                    if (reactionOpt.isPresent()) {
                        PostReaction reaction = reactionOpt.get();
                        likeCount = reaction.getLikes().intValue();
                        dislikeCount = reaction.getDislikes().intValue();
                    }
                    
                    return new PostDto(
                            p.getId(),
                            p.getUserId(),
                            p.getUser().getUsername(), // writer 필드에 작성자 이름 추가
                            p.getTitle(),
                            p.getContent(),
                            p.getCategory(),
                            p.getCreatedAt(),
                            p.getUpdatedAt(),
                            likeCount,
                            dislikeCount
                    );
                })
                .toList();
    }
}
