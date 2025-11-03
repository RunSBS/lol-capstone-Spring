package hyun.auth.service;

import hyun.db.entity.*;
import hyun.db.repo.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShopService {
    private final ShopItemRepository shopItemRepository;
    private final UserRepository userRepository;
    private final UserItemRepository userItemRepository;
    private final PurchaseHistoryRepository purchaseHistoryRepository;
    private final TokenTransactionRepository tokenTransactionRepository;

    /**
     * 상품 구매
     */
    @Transactional
    public PurchaseResult purchaseItem(Long userId, String itemCode, Integer quantity) {
        // 1. 상품 조회
        ShopItem item = shopItemRepository.findByItemCode(itemCode)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."));
        
        if (!item.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매 중지된 상품입니다.");
        }
        
        // 2. 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        // 3. 토큰 잔액 확인
        Long totalPrice = item.getPrice() * quantity;
        if (user.getTokenBalance() < totalPrice) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "토큰이 부족합니다.");
        }
        
        // 4. 구매 전 토큰 잔액 저장
        Long tokenBalanceBefore = user.getTokenBalance();
        
        // 5. 토큰 차감
        Long tokenBalanceAfter = tokenBalanceBefore - totalPrice;
        user.setTokenBalance(tokenBalanceAfter);
        userRepository.save(user);
        
        // 6. 구매 이력 기록
        PurchaseHistory history = new PurchaseHistory();
        history.setUser(user);
        history.setShopItem(item);
        history.setQuantity(quantity);
        history.setPricePaid(item.getPrice());
        history.setTokenBalanceBefore(tokenBalanceBefore);
        history.setTokenBalanceAfter(tokenBalanceAfter);
        history.setPurchasedAt(LocalDateTime.now());
        purchaseHistoryRepository.save(history);
        
        // 7. 보유 아이템 업데이트 (기존 보유 시 수량 증가, 없으면 생성)
        UserItem userItem = userItemRepository
            .findByUserAndShopItem(user, item)
            .orElseGet(() -> {
                UserItem newItem = new UserItem();
                newItem.setUser(user);
                newItem.setShopItem(item);
                newItem.setQuantity(0);
                newItem.setIsEquipped(false);
                newItem.setPurchasedAt(LocalDateTime.now());
                return newItem;
            });
        
        userItem.setQuantity(userItem.getQuantity() + quantity);
        userItemRepository.save(userItem);
        
        // 8. 토큰 거래 이력 기록
        TokenTransaction tx = new TokenTransaction();
        tx.setUser(user);
        tx.setAmount(-totalPrice);  // 음수는 소비
        tx.setBalanceBefore(tokenBalanceBefore);
        tx.setBalanceAfter(tokenBalanceAfter);
        tx.setTransactionType("PURCHASE");
        tx.setDescription(item.getName() + " " + quantity + "개 구매");
        tx.setCreatedAt(LocalDateTime.now());
        tokenTransactionRepository.save(tx);
        
        log.info("구매 완료: userId={}, itemCode={}, quantity={}, price={}, 잔액={} -> {}", 
            userId, itemCode, quantity, totalPrice, tokenBalanceBefore, tokenBalanceAfter);
        
        return PurchaseResult.builder()
            .success(true)
            .message("구매 완료")
            .remainingTokens(tokenBalanceAfter)
            .newQuantity(userItem.getQuantity())
            .build();
    }

    /**
     * 상품 목록 조회
     */
    public List<ShopItem> getShopItems(String itemType) {
        if (itemType != null && !itemType.isEmpty()) {
            return shopItemRepository.findByItemTypeAndIsActiveTrue(itemType);
        }
        return shopItemRepository.findAll().stream()
            .filter(ShopItem::getIsActive)
            .toList();
    }

    /**
     * 사용자 보유 아이템 조회
     */
    @Transactional(readOnly = true)
    public List<UserItem> getUserItems(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        return userItemRepository.findByUser(user);
    }

    /**
     * 아이템 장착/해제 (테두리, 배너용)
     */
    @Transactional
    public void equipItem(Long userId, Long userItemId, boolean equip) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        UserItem userItem = userItemRepository.findById(userItemId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "보유 아이템을 찾을 수 없습니다."));
        
        if (!userItem.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 아이템만 장착할 수 있습니다.");
        }
        
        String itemType = userItem.getShopItem().getItemType();
        if (!"BORDER".equals(itemType) && !"BANNER".equals(itemType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "장착 가능한 아이템이 아닙니다.");
        }
        
        if (equip) {
            // 같은 타입의 다른 아이템 해제
            List<UserItem> sameTypeItems = userItemRepository
                .findByUserAndShopItem_ItemType(user, itemType);
            sameTypeItems.forEach(item -> item.setIsEquipped(false));
            userItemRepository.saveAll(sameTypeItems);
            
            // 선택한 아이템 장착
            userItem.setIsEquipped(true);
        } else {
            userItem.setIsEquipped(false);
        }
        
        userItemRepository.save(userItem);
    }

    /**
     * 출석 보상 지급 (AttendanceService에서 호출)
     */
    @Transactional
    public void giveAttendanceReward(Long userId, Long rewardAmount) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        Long currentBalance = user.getTokenBalance();
        Long newBalance = currentBalance + rewardAmount;
        
        user.setTokenBalance(newBalance);
        userRepository.save(user);
        
        // 거래 이력 기록
        TokenTransaction tx = new TokenTransaction();
        tx.setUser(user);
        tx.setAmount(rewardAmount);
        tx.setBalanceBefore(currentBalance);
        tx.setBalanceAfter(newBalance);
        tx.setTransactionType("ATTENDANCE");
        tx.setDescription("출석 보상");
        tx.setCreatedAt(LocalDateTime.now());
        tokenTransactionRepository.save(tx);
        
        log.info("출석 보상 지급: userId={}, 토큰={}, 잔액={} -> {}", 
            userId, rewardAmount, currentBalance, newBalance);
    }

    @Getter
    @Builder
    public static class PurchaseResult {
        private boolean success;
        private String message;
        private Long remainingTokens;
        private Integer newQuantity;
    }
}

