package hyun.db.repo;

import hyun.db.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost_Id(Long postId);
    
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findByPost_IdAndIsDeletedFalse(@Param("postId") Long postId);
}
