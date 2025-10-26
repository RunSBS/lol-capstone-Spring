package hyun.db.repo;

import hyun.db.entity.BetVote;
import hyun.db.entity.Bet;
import hyun.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BetVoteRepository extends JpaRepository<BetVote, Long> {
    Optional<BetVote> findByBetAndUser(Bet bet, User user);
    List<BetVote> findByBet(Bet bet);
}
