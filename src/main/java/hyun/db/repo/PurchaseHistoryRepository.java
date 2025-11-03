package hyun.db.repo;

import hyun.db.entity.PurchaseHistory;
import hyun.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseHistoryRepository extends JpaRepository<PurchaseHistory, Long> {
    List<PurchaseHistory> findByUserOrderByPurchasedAtDesc(User user);
}

