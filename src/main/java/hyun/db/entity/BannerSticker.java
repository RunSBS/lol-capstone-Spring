package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 배너에 부착된 스티커 테이블 (BANNER_STICKERS)
 * - 사용자 배너에 부착된 스티커의 위치 정보 저장
 */
@Entity
@Table(name = "BANNER_STICKERS")
@Getter
@Setter
public class BannerSticker {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "banner_sticker_seq")
    @SequenceGenerator(name = "banner_sticker_seq", sequenceName = "BANNER_STICKERS_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHOP_ITEM_ID", nullable = false)
    private ShopItem shopItem;  // 어떤 스티커인지
    
    @Column(name = "POSITION_X", nullable = false)
    private Double positionX;   // 배너 내 X 좌표 (0.0 ~ 1.0)
    
    @Column(name = "POSITION_Y", nullable = false)
    private Double positionY;   // 배너 내 Y 좌표 (0.0 ~ 1.0)
    
    @Column(nullable = false)
    private Double width;        // 스티커 너비 (px 또는 배율)
    
    @Column(nullable = false)
    private Double height;       // 스티커 높이
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt = LocalDateTime.now();
}

