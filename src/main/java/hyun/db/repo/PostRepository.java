package hyun.db.repo;

import hyun.db.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findByIdAndUser_Id(Long id, Long userId);
    
    @EntityGraph(attributePaths = {"user"})
    @Override
    List<Post> findAll();
    
    @EntityGraph(attributePaths = {"user"})
    @Override
    Optional<Post> findById(Long id);
    
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM Post p WHERE :category IS NULL OR :category = '' OR p.category = :category ORDER BY p.createdAt DESC")
    Page<Post> findAllByCategory(@Param("category") String category, Pageable pageable);
}