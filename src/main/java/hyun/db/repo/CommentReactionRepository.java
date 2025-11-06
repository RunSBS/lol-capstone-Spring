package hyun.db.repo;

import hyun.db.entity.Comment;
import hyun.db.entity.CommentReaction;
import hyun.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByCommentAndUser(Comment comment, User user);
    boolean existsByCommentAndUser(Comment comment, User user);
    long countByCommentAndReactionType(Comment comment, String reactionType);
}

