package hyun.db.repo;

import hyun.db.entity.Bet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    @EntityGraph(attributePaths = {"post", "bettorA", "bettorB"})
    Optional<Bet> findByPost_Id(Long postId);
    
    // 마감되었지만 아직 정산되지 않은 내기 조회
    // @Query를 사용하여 더 정확하게 조회
    @org.springframework.data.jpa.repository.Query(
        "SELECT b FROM Bet b WHERE b.deadline < :now " +
        "AND b.id NOT IN (SELECT bs.bet.id FROM BetSettlement bs)"
    )
    List<Bet> findExpiredUnsettledBets(Instant now);
}
