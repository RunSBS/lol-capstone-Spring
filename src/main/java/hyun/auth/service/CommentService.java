package hyun.auth.service;

import hyun.auth.dto.CommentDto;
import hyun.db.entity.Comment;
import hyun.db.entity.Post;
import hyun.db.entity.User;
import hyun.db.repo.CommentRepository;
import hyun.db.repo.PostRepository;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {
    private final CommentRepository comments;
    private final PostRepository posts;
    private final UserRepository users;

    private User me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            log.error("Authentication is null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        }
        String username = auth.getName();
        log.info("Looking up user: {}", username);
        return users.findByUsername(username).orElseThrow(() -> {
            log.error("User not found: {}", username);
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자 없음: " + username);
        });
    }

    @Transactional
    public CommentDto create(Long postId, String content) {
        try {
            log.info("Creating comment for postId: {}, content: {}", postId, content);
            User u = me();
            log.info("Found user: {}", u.getUsername());
            
            Post p = posts.findById(postId).orElseThrow(() -> {
                log.error("Post not found: {}", postId);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음");
            });
            log.info("Found post: {}", p.getId());
            
            Comment c = new Comment();
            c.setPost(p);
            c.setUser(u);
            c.setContent(content);
            c.setLikes(0L);
            c.setDislikes(0L);
            c.setCreatedAt(Instant.now());
            c.setIsDeleted(false);
            
            Comment saved = comments.save(c);
            log.info("Saved comment with id: {}", saved.getId());
            
            // LAZY 로딩 문제 방지를 위해 flush 후 직접 DTO 생성
            comments.flush();
            
            CommentDto dto = new CommentDto(
                    saved.getId(),
                    p.getId(),
                    u.getId(),
                    u.getUsername(),
                    saved.getContent(),
                    saved.getLikes(),
                    saved.getDislikes(),
                    saved.getCreatedAt()
            );
            
            log.info("Successfully created comment: {}", dto.getId());
            return dto;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating comment", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 작성 실패: " + e.getMessage());
        }
    }

    @Transactional
    public CommentDto update(Long commentId, String content) {
        User u = me();
        Comment c = comments.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        if (!c.getUser().getId().equals(u.getId())) 
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 수정 가능");
        c.setContent(content);
        Comment saved = comments.save(c);
        comments.flush();
        return new CommentDto(
                saved.getId(),
                saved.getPost().getId(),
                saved.getUser().getId(),
                saved.getUser().getUsername(),
                saved.getContent(),
                saved.getLikes(),
                saved.getDislikes(),
                saved.getCreatedAt()
        );
    }

    @Transactional
    public void delete(Long commentId) {
        User u = me();
        Comment c = comments.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        if (!c.getUser().getId().equals(u.getId())) 
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제 가능");
        // 소프트 삭제: 실제로 삭제하지 않고 isDeleted를 true로 변경
        c.setIsDeleted(true);
        comments.save(c);
    }

    public List<CommentDto> findByPostId(Long postId) {
        return comments.findByPost_IdAndIsDeletedFalse(postId).stream()
                .map(c -> new CommentDto(
                        c.getId(),
                        c.getPost().getId(),
                        c.getUser().getId(),
                        c.getUser().getUsername(),
                        c.getContent(),
                        c.getLikes(),
                        c.getDislikes(),
                        c.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void likeComment(Long commentId) {
        me(); // 인증 체크
        Comment c = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        c.setLikes(c.getLikes() + 1);
        comments.save(c);
    }

    @Transactional
    public void dislikeComment(Long commentId) {
        me(); // 인증 체크
        Comment c = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        c.setDislikes(c.getDislikes() + 1);
        comments.save(c);
    }

    @Transactional
    public void removeLikeComment(Long commentId) {
        me(); // 인증 체크
        Comment c = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        c.setLikes(Math.max(c.getLikes() - 1, 0));
        comments.save(c);
    }

    @Transactional
    public void removeDislikeComment(Long commentId) {
        me(); // 인증 체크
        Comment c = comments.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글 없음"));
        c.setDislikes(Math.max(c.getDislikes() - 1, 0));
        comments.save(c);
    }
}
