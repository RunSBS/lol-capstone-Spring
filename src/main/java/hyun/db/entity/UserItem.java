package hyun.db.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 사용자 보유 아이템 테이블 (USER_ITEMS)
 * - 사용자가 구매한 상품과 보유 수량 관리
 */
@Entity
@Table(name = "USER_ITEMS", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"USER_ID", "SHOP_ITEM_ID"}))
@Getter
@Setter
public class UserItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_item_seq")
    @SequenceGenerator(name = "user_item_seq", sequenceName = "USER_ITEMS_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    @JsonIgnore
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ITEM_ID", nullable = false)
    private ShopItem shopItem;
    
    @Column(nullable = false)
    private Integer quantity = 1;  // 보유 수량 (테두리/배너는 1, 스티커는 여러 개)
    
    @Column(name = "IS_EQUIPPED")
    private Boolean isEquipped = false;  // 현재 사용 중인지 (테두리/배너용)
    
    @Column(name = "PURCHASED_AT")
    private LocalDateTime purchasedAt = LocalDateTime.now();
}

