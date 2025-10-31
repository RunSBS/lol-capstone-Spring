package hyun.db.repo;

import hyun.db.entity.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {
    Optional<ShopItem> findByItemCode(String itemCode);
    List<ShopItem> findByItemType(String itemType);
    List<ShopItem> findByItemTypeAndIsActiveTrue(String itemType);
    List<ShopItem> findByCategory(String category);
}

