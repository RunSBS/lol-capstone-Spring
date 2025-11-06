package hyun.db.repo;

import hyun.db.entity.Bet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // 사용자가 투표한 내기 중 정산 완료된 것 조회
    // Oracle의 ORA-01791 에러 방지를 위해 ORDER BY 제거 (서비스 레이어에서 정렬)
    @Query("SELECT DISTINCT b FROM Bet b " +
           "JOIN BetVote bv ON bv.bet = b " +
           "JOIN BetSettlement bs ON bs.bet = b " +
           "WHERE bv.user.id = :userId " +
           "AND bs.settledAt > :since")
    List<Bet> findSettledBetsByUserVote(@Param("userId") Long userId, 
                                         @Param("since") Instant since);
}
