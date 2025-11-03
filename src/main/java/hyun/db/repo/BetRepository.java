package hyun.db.repo;

import hyun.db.entity.Bet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    @EntityGraph(attributePaths = {"post", "bettorA", "bettorB"})
    Optional<Bet> findByPost_Id(Long postId);
}
