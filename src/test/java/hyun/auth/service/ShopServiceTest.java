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

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShopService 테스트")
class ShopServiceTest {

    @Mock
    private ShopItemRepository shopItemRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserItemRepository userItemRepository;
    
    @Mock
    private PurchaseHistoryRepository purchaseHistoryRepository;
    
    @Mock
    private TokenTransactionRepository tokenTransactionRepository;

    @InjectMocks
    private ShopService shopService;

    private User testUser;
    private ShopItem testItem;
    private Long userId = 1L;
    private String itemCode = "sticker_champion_Ahri";

    @BeforeEach
    void setUp() {
        // 테스트용 사용자 설정
        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");
        testUser.setTokenBalance(1000L); // 초기 토큰 1000개

        // 테스트용 상품 설정
        testItem = new ShopItem();
        testItem.setId(1L);
        testItem.setItemCode(itemCode);
        testItem.setItemType("STICKER");
        testItem.setName("아리 스티커");
        testItem.setPrice(50L); // 상품 가격 50토큰
        testItem.setIsActive(true);
    }

    @Test
    @DisplayName("정상적인 상품 구매 성공")
    void purchaseItem_Success() {
        // Given
        Integer quantity = 5;
        Long totalPrice = testItem.getPrice() * quantity; // 250토큰

        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userItemRepository.findByUserAndShopItem(testUser, testItem))
            .thenReturn(Optional.empty()); // 처음 구매

        // When
        ShopService.PurchaseResult result = shopService.purchaseItem(userId, itemCode, quantity);

        // Then
        assertTrue(result.isSuccess());
        assertEquals(750L, result.getRemainingTokens()); // 1000 - 250 = 750
        assertEquals(5, result.getNewQuantity());

        // 토큰 차감 확인
        assertEquals(750L, testUser.getTokenBalance());

        // Repository 메서드 호출 확인
        verify(userRepository, times(1)).save(testUser);
        verify(purchaseHistoryRepository, times(1)).save(any(PurchaseHistory.class));
        verify(userItemRepository, times(1)).save(any(UserItem.class));
        verify(tokenTransactionRepository, times(1)).save(any(TokenTransaction.class));
    }

    @Test
    @DisplayName("상품 구매 - 기존 보유 아이템 수량 증가")
    void purchaseItem_ExistingItem_QuantityIncreases() {
        // Given
        Integer quantity = 3;
        UserItem existingUserItem = new UserItem();
        existingUserItem.setId(1L);
        existingUserItem.setUser(testUser);
        existingUserItem.setShopItem(testItem);
        existingUserItem.setQuantity(2); // 이미 2개 보유

        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userItemRepository.findByUserAndShopItem(testUser, testItem))
            .thenReturn(Optional.of(existingUserItem));

        // When
        ShopService.PurchaseResult result = shopService.purchaseItem(userId, itemCode, quantity);

        // Then
        assertTrue(result.isSuccess());
        assertEquals(5, result.getNewQuantity()); // 2 + 3 = 5
        assertEquals(5, existingUserItem.getQuantity());
        verify(userItemRepository, times(1)).save(existingUserItem);
    }

    @Test
    @DisplayName("상품 구매 실패 - 존재하지 않는 상품")
    void purchaseItem_ItemNotFound() {
        // Given
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.empty());

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> shopService.purchaseItem(userId, itemCode, 1)
        );
        assertEquals(404, exception.getStatusCode().value());
        assertEquals("상품을 찾을 수 없습니다.", exception.getReason());
    }

    @Test
    @DisplayName("상품 구매 실패 - 판매 중지된 상품")
    void purchaseItem_InactiveItem() {
        // Given
        testItem.setIsActive(false);
        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> shopService.purchaseItem(userId, itemCode, 1)
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("판매 중지된 상품입니다.", exception.getReason());
    }

    @Test
    @DisplayName("상품 구매 실패 - 토큰 부족")
    void purchaseItem_InsufficientTokens() {
        // Given
        testUser.setTokenBalance(100L); // 토큰 100개만 보유
        Integer quantity = 5; // 250토큰 필요

        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> shopService.purchaseItem(userId, itemCode, quantity)
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("토큰이 부족합니다.", exception.getReason());

        // 토큰이 차감되지 않았는지 확인
        assertEquals(100L, testUser.getTokenBalance());
        verify(userRepository, never()).save(testUser);
    }

    @Test
    @DisplayName("구매 이력 - pricePaid는 단가로 저장되는지 확인")
    void purchaseItem_PricePaidIsUnitPrice() {
        // Given
        Integer quantity = 5;
        Long totalPrice = testItem.getPrice() * quantity; // 250토큰

        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userItemRepository.findByUserAndShopItem(testUser, testItem))
            .thenReturn(Optional.empty());

        // When
        shopService.purchaseItem(userId, itemCode, quantity);

        // Then
        verify(purchaseHistoryRepository, times(1)).save(argThat(history -> {
            PurchaseHistory h = (PurchaseHistory) history;
            // pricePaid는 단가(50)로 저장되어야 함 (총액 250이 아님)
            return h.getPricePaid().equals(50L) && 
                   h.getQuantity().equals(5) &&
                   h.getTokenBalanceBefore().equals(1000L) &&
                   h.getTokenBalanceAfter().equals(750L);
        }));
    }

    @Test
    @DisplayName("토큰 거래 이력 - 음수 amount로 저장되는지 확인")
    void purchaseItem_TokenTransactionNegativeAmount() {
        // Given
        Integer quantity = 3;
        Long totalPrice = testItem.getPrice() * quantity; // 150토큰

        when(shopItemRepository.findByItemCode(itemCode)).thenReturn(Optional.of(testItem));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userItemRepository.findByUserAndShopItem(testUser, testItem))
            .thenReturn(Optional.empty());

        // When
        shopService.purchaseItem(userId, itemCode, quantity);

        // Then
        verify(tokenTransactionRepository, times(1)).save(argThat(tx -> {
            TokenTransaction t = (TokenTransaction) tx;
            return t.getAmount().equals(-150L) && // 음수로 저장
                   t.getTransactionType().equals("PURCHASE") &&
                   t.getBalanceBefore().equals(1000L) &&
                   t.getBalanceAfter().equals(850L);
        }));
    }
}

