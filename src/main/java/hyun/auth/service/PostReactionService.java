package hyun.auth.service;

import hyun.db.entity.Post;
import hyun.db.entity.PostReaction;
import hyun.db.repo.PostReactionRepository;
import hyun.db.repo.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostReactionService {
    private final PostReactionRepository reactions;
    private final PostRepository posts;

    @Transactional
    public void likePost(Long postId) {
        Post post = posts.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        
        Optional<PostReaction> reactionOpt = reactions.findByPost_Id(postId);
        
        if (reactionOpt.isPresent()) {
            PostReaction reaction = reactionOpt.get();
            reaction.setLikes(reaction.getLikes() + 1);
            reactions.save(reaction);
        } else {
            PostReaction reaction = new PostReaction();
            reaction.setPost(post);
            reaction.setLikes(1L);
            reaction.setDislikes(0L);
            reactions.save(reaction);
        }
    }

    @Transactional
    public void dislikePost(Long postId) {
        Post post = posts.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        
        Optional<PostReaction> reactionOpt = reactions.findByPost_Id(postId);
        
        if (reactionOpt.isPresent()) {
            PostReaction reaction = reactionOpt.get();
            reaction.setDislikes(reaction.getDislikes() + 1);
            reactions.save(reaction);
        } else {
            PostReaction reaction = new PostReaction();
            reaction.setPost(post);
            reaction.setLikes(0L);
            reaction.setDislikes(1L);
            reactions.save(reaction);
        }
    }

    @Transactional
    public void removeLikePost(Long postId) {
        reactions.findByPost_Id(postId).ifPresent(reaction -> {
            reaction.setLikes(Math.max(reaction.getLikes() - 1, 0));
            reactions.save(reaction);
        });
    }

    @Transactional
    public void removeDislikePost(Long postId) {
        reactions.findByPost_Id(postId).ifPresent(reaction -> {
            reaction.setDislikes(Math.max(reaction.getDislikes() - 1, 0));
            reactions.save(reaction);
        });
    }

    public PostReaction getReaction(Long postId) {
        return reactions.findByPost_Id(postId).orElse(null);
    }
}

