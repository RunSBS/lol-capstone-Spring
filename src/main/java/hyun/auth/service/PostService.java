package hyun.auth.service;

import hyun.db.entity.Post;
import hyun.db.entity.User;
import hyun.db.repo.PostRepository;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;

    private User me() {
        String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return users.findByUsername(username).orElseThrow();
    }

    @Transactional
    public Post create(String title, String content) {
        User u = me();
        Post p = new Post();
        p.setAuthor(u);
        p.setTitle(title);
        p.setContent(content);
        return posts.save(p);
    }

    @Transactional
    public Post update(Long postId, String title, String content) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        if (!p.getAuthor().getId().equals(u.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 수정 가능");
        p.setTitle(title);
        p.setContent(content);
        p.setUpdatedAt(Instant.now());
        return posts.save(p);
    }

    @Transactional
    public void delete(Long postId) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        if (!p.getAuthor().getId().equals(u.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제 가능");
        posts.delete(p);
    }
}
