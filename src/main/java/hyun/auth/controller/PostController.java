package hyun.auth.controller;

import hyun.auth.dto.PostDto;
import hyun.auth.service.PostReactionService;
import hyun.auth.service.PostService;
import hyun.db.entity.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {
    private final PostService postService;
    private final PostReactionService postReactionService;

    public record CreatePostReq(String title, String content, String category) {}
    public record UpdatePostReq(String title, String content) {}

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(@RequestParam(required = false) String category) {
        log.info("Getting all posts, category: {}", category);
        List<PostDto> posts = postService.findAll(category);
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody CreatePostReq req) {
        log.info("Received create post request: title={}, content={}, category={}", req.title(), req.content(), req.category());
        Post post = postService.create(req.title(), req.content(), req.category());
        log.info("Created post with ID: {}", post.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id) {
        PostDto post = postService.findById(id);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody UpdatePostReq req) {
        Post post = postService.update(id, req.title(), req.content());
        return ResponseEntity.ok(post);
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
}

