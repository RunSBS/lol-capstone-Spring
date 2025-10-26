package hyun.db.repo;

import hyun.db.entity.BetSettlement;
import hyun.db.entity.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BetSettlementRepository extends JpaRepository<BetSettlement, Long> {
    Optional<BetSettlement> findByBet(Bet bet);
}
