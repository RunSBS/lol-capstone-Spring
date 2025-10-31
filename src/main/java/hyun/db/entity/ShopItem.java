package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 상품 마스터 테이블 (SHOP_ITEMS)
 * - 테두리, 배너, 스티커 등 모든 상품 정보 관리
 */
@Entity
@Table(name = "SHOP_ITEMS")
@Getter
@Setter
public class ShopItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "shop_item_seq")
    @SequenceGenerator(name = "shop_item_seq", sequenceName = "SHOP_ITEMS_SEQ", allocationSize = 1)
    private Long id;
    
    @Column(name = "ITEM_CODE", nullable = false, length = 50, unique = true)
    private String itemCode;      // "border_gold", "banner_ahri", "sticker_champion_Ahri"
    
    @Column(name = "ITEM_TYPE", nullable = false, length = 20)
    private String itemType;      // "BORDER", "BANNER", "STICKER"
    
    @Column(nullable = false, length = 100)
    private String name;          // "골드 테두리", "아리 배너", "아리 스티커"
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Long price;           // 토큰 가격
    
    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;      // 배너/스티커 이미지 URL
    
    @Column(length = 50)
    private String category;      // 스티커 카테고리: "champion", "item", "rune" (NULL 허용)
    
    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean isActive = true;  // 판매 중 여부
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt = LocalDateTime.now();
}

