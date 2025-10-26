package hyun.db.repo;

import hyun.db.entity.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    Optional<Bet> findByPostId(Long postId);
}
