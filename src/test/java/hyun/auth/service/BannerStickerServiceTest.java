package hyun.auth.service;

import hyun.db.entity.*;
import hyun.db.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BannerStickerService 테스트")
class BannerStickerServiceTest {

    @Mock
    private BannerStickerRepository bannerStickerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShopItemRepository shopItemRepository;

    @Mock
    private UserItemRepository userItemRepository;

    @InjectMocks
    private BannerStickerService bannerStickerService;

    private User testUser;
    private ShopItem stickerItem;
    private UserItem userItem;
    private Long userId = 1L;
    private String itemCode = "sticker_champion_Ahri";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        stickerItem = new ShopItem();
        stickerItem.setId(1L);
        stickerItem.setItemCode(itemCode);
        stickerItem.setItemType("STICKER");
        stickerItem.setName("아리 스티커");

        userItem = new UserItem();
        userItem.setId(1L);
        userItem.setUser(testUser);
        userItem.setShopItem(stickerItem);
        userItem.setQuantity(5); // 5개 보유
    }

    @Test
    @DisplayName("스티커 부착 성공 - 수량 차감")
    void addStickerToBanner_Success() {
        // Given
        Double positionX = 0.3;
        Double positionY = 0.4;
        Double width = 100.0;
        Double height = 100.0;

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(stickerItem));
        when(userItemRepository.findByUserAndShopItem(testUser, stickerItem))
            .thenReturn(Optional.of(userItem));

        // When
        BannerSticker result = bannerStickerService.addStickerToBanner(
            userId, itemCode, positionX, positionY, width, height);

        // Then
        assertNotNull(result);
        assertEquals(4, userItem.getQuantity()); // 5 -> 4로 차감

        verify(bannerStickerRepository, times(1)).save(any(BannerSticker.class));
        verify(userItemRepository, times(1)).save(userItem);
    }

    @Test
    @DisplayName("스티커 부착 - 마지막 1개 사용 시 UserItem 삭제")
    void addStickerToBanner_LastItem_UserItemDeleted() {
        // Given
        userItem.setQuantity(1); // 마지막 1개

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(stickerItem));
        when(userItemRepository.findByUserAndShopItem(testUser, stickerItem))
            .thenReturn(Optional.of(userItem));

        // When
        bannerStickerService.addStickerToBanner(userId, itemCode, 0.3, 0.4, 100.0, 100.0);

        // Then
        assertEquals(0, userItem.getQuantity());
        // 수량이 0이 되면 UserItem이 삭제됨
        verify(userItemRepository, times(1)).delete(userItem);
        verify(userItemRepository, never()).save(userItem);
    }

    @Test
    @DisplayName("스티커 부착 실패 - 보유하지 않은 스티커")
    void addStickerToBanner_NotOwned() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(stickerItem));
        when(userItemRepository.findByUserAndShopItem(testUser, stickerItem))
            .thenReturn(Optional.empty()); // 보유하지 않음

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> bannerStickerService.addStickerToBanner(userId, itemCode, 0.3, 0.4, 100.0, 100.0)
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("보유하지 않은 스티커입니다.", exception.getReason());
    }

    @Test
    @DisplayName("스티커 부착 실패 - 스티커 타입이 아닌 아이템")
    void addStickerToBanner_NotStickerType() {
        // Given
        stickerItem.setItemType("BORDER"); // 스티커가 아님

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(stickerItem));

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> bannerStickerService.addStickerToBanner(userId, itemCode, 0.3, 0.4, 100.0, 100.0)
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("스티커 타입이 아닙니다.", exception.getReason());
    }

    @Test
    @DisplayName("스티커 제거 성공")
    void removeStickerFromBanner_Success() {
        // Given
        Long bannerStickerId = 1L;
        BannerSticker bannerSticker = new BannerSticker();
        bannerSticker.setId(bannerStickerId);
        bannerSticker.setUser(testUser);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(bannerStickerRepository.findById(bannerStickerId))
            .thenReturn(Optional.of(bannerSticker));

        // When
        bannerStickerService.removeStickerFromBanner(userId, bannerStickerId);

        // Then
        verify(bannerStickerRepository, times(1)).delete(bannerSticker);
    }

    @Test
    @DisplayName("스티커 제거 실패 - 다른 사용자의 스티커")
    void removeStickerFromBanner_NotOwned() {
        // Given
        Long bannerStickerId = 1L;
        User otherUser = new User();
        otherUser.setId(999L);

        BannerSticker bannerSticker = new BannerSticker();
        bannerSticker.setId(bannerStickerId);
        bannerSticker.setUser(otherUser); // 다른 사용자

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(bannerStickerRepository.findById(bannerStickerId))
            .thenReturn(Optional.of(bannerSticker));

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> bannerStickerService.removeStickerFromBanner(userId, bannerStickerId)
        );
        assertEquals(403, exception.getStatusCode().value());
        assertEquals("본인의 스티커만 제거할 수 있습니다.", exception.getReason());
    }
}

