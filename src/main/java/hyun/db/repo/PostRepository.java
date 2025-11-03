package hyun.db.repo;

import hyun.db.entity.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

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
}