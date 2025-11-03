package hyun.db.repo;

import hyun.db.entity.TokenTransaction;
import hyun.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, Long> {
    List<TokenTransaction> findByUserOrderByCreatedAtDesc(User user);
    List<TokenTransaction> findByUserAndTransactionTypeOrderByCreatedAtDesc(User user, String transactionType);
    long countByUser_IdAndTransactionTypeAndCreatedAtBetween(Long userId, String transactionType, LocalDateTime start, LocalDateTime end);
}

