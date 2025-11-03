package hyun.db.repo;

import hyun.db.entity.ShopItem;
import hyun.db.entity.User;
import hyun.db.entity.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserItemRepository extends JpaRepository<UserItem, Long> {
    @Query("SELECT ui FROM UserItem ui JOIN FETCH ui.shopItem WHERE ui.user = :user")
    List<UserItem> findByUser(@Param("user") User user);
    
    @Query("SELECT ui FROM UserItem ui JOIN FETCH ui.shopItem WHERE ui.user = :user AND ui.shopItem = :shopItem")
    Optional<UserItem> findByUserAndShopItem(@Param("user") User user, @Param("shopItem") ShopItem shopItem);
    
    @Query("SELECT ui FROM UserItem ui JOIN FETCH ui.shopItem WHERE ui.user = :user AND ui.isEquipped = true")
    List<UserItem> findByUserAndIsEquippedTrue(@Param("user") User user);
    
    @Query("SELECT ui FROM UserItem ui JOIN FETCH ui.shopItem WHERE ui.user = :user AND ui.shopItem.itemType = :itemType")
    List<UserItem> findByUserAndShopItem_ItemType(@Param("user") User user, @Param("itemType") String itemType);
}

