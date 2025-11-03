package hyun.db.repo;

import hyun.db.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost_Id(Long postId);
    
    List<Comment> findByPost_IdAndIsDeletedFalse(Long postId);
}
