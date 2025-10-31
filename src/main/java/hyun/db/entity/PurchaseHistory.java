package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 구매 내역 테이블 (PURCHASE_HISTORY)
 * - 사용자의 상품 구매 이력 저장
 */
@Entity
@Table(name = "PURCHASE_HISTORY")
@Getter
@Setter
public class PurchaseHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "purchase_history_seq")
    @SequenceGenerator(name = "purchase_history_seq", sequenceName = "PURCHASE_HISTORY_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ITEM_ID", nullable = false)
    private ShopItem shopItem;
    
    @Column(nullable = false)
    private Integer quantity;      // 구매 수량
    
    @Column(name = "PRICE_PAID", nullable = false)
    private Long pricePaid;        // 구매 당시 가격 (상품 가격 변동 대비)
    
    @Column(name = "TOKEN_BALANCE_BEFORE", nullable = false)
    private Long tokenBalanceBefore;  // 구매 전 토큰
    
    @Column(name = "TOKEN_BALANCE_AFTER", nullable = false)
    private Long tokenBalanceAfter;   // 구매 후 토큰
    
    @Column(name = "PURCHASED_AT")
    private LocalDateTime purchasedAt = LocalDateTime.now();
}

