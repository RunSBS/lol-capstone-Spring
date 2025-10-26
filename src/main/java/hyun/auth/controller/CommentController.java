package hyun.auth.controller;

import hyun.auth.dto.CommentDto;
import hyun.auth.service.CommentService;
import hyun.db.entity.Comment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    private final CommentService commentService;

    public record CreateCommentReq(Long postId, String content) {}

    @GetMapping
    public ResponseEntity<List<CommentDto>> getCommentsByPostId(@RequestParam Long postId) {
        log.info("Getting comments for post ID: {}", postId);
        List<CommentDto> comments = commentService.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CreateCommentReq req) {
        try {
            log.info("Received comment creation request for postId: {}, content: {}", req.postId(), req.content());
            CommentDto comment = commentService.create(req.postId(), req.content());
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            log.error("Error creating comment", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok(Map.of("message", "댓글 삭제 성공"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, String>> likeComment(@PathVariable Long id) {
        commentService.likeComment(id);
        return ResponseEntity.ok(Map.of("message", "좋아요 성공"));
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<Map<String, String>> dislikeComment(@PathVariable Long id) {
        commentService.dislikeComment(id);
        return ResponseEntity.ok(Map.of("message", "싫어요 성공"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Map<String, String>> removeLike(@PathVariable Long id) {
        commentService.removeLikeComment(id);
        return ResponseEntity.ok(Map.of("message", "좋아요 취소 성공"));
    }

    @DeleteMapping("/{id}/dislike")
    public ResponseEntity<Map<String, String>> removeDislike(@PathVariable Long id) {
        commentService.removeDislikeComment(id);
        return ResponseEntity.ok(Map.of("message", "싫어요 취소 성공"));
    }
}

