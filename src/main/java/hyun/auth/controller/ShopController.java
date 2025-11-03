package hyun.auth.controller;

import hyun.auth.service.BannerStickerService;
import hyun.auth.service.ShopService;
import hyun.db.entity.BannerSticker;
import hyun.db.entity.ShopItem;
import hyun.db.entity.User;
import hyun.db.entity.UserItem;
import hyun.db.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
@Slf4j
public class ShopController {
    private final ShopService shopService;
    private final BannerStickerService bannerStickerService;
    private final UserRepository userRepository;

    /**
     * 상품 목록 조회
     */
    @GetMapping("/items")
    public ResponseEntity<List<ShopItem>> getItems(
            @RequestParam(required = false) String itemType) {
        return ResponseEntity.ok(shopService.getShopItems(itemType));
    }

    /**
     * 상품 구매
     */
    @PostMapping("/purchase")
    public ResponseEntity<ShopService.PurchaseResult> purchase(
            @RequestBody Map<String, Object> request) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        String itemCode = (String) request.get("itemCode");
        Integer quantity = request.get("quantity") != null ? 
            ((Number) request.get("quantity")).intValue() : 1;
        
        ShopService.PurchaseResult result = shopService.purchaseItem(user.getId(), itemCode, quantity);
        return ResponseEntity.ok(result);
    }

    /**
     * 내 보유 아이템 조회
     */
    @GetMapping("/my-items")
    public ResponseEntity<List<UserItem>> getMyItems() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(shopService.getUserItems(user.getId()));
    }

    /**
     * 아이템 장착/해제
     */
    @PostMapping("/equip/{userItemId}")
    public ResponseEntity<String> equipItem(
            @PathVariable Long userItemId,
            @RequestParam boolean equip) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        shopService.equipItem(user.getId(), userItemId, equip);
        return ResponseEntity.ok(equip ? "장착 완료" : "해제 완료");
    }

    /**
     * 배너에 스티커 부착
     */
    @PostMapping("/banner/sticker")
    public ResponseEntity<BannerSticker> addStickerToBanner(
            @RequestBody Map<String, Object> request) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        String itemCode = (String) request.get("itemCode");
        Double positionX = ((Number) request.get("positionX")).doubleValue();
        Double positionY = ((Number) request.get("positionY")).doubleValue();
        Double width = ((Number) request.get("width")).doubleValue();
        Double height = ((Number) request.get("height")).doubleValue();
        
        BannerSticker result = bannerStickerService.addStickerToBanner(
            user.getId(), itemCode, positionX, positionY, width, height);
        return ResponseEntity.ok(result);
    }

    /**
     * 배너에서 스티커 제거
     */
    @DeleteMapping("/banner/sticker/{bannerStickerId}")
    public ResponseEntity<String> removeStickerFromBanner(
            @PathVariable Long bannerStickerId) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        bannerStickerService.removeStickerFromBanner(user.getId(), bannerStickerId);
        return ResponseEntity.ok("스티커 제거 완료");
    }

    /**
     * 배너 스티커 목록 조회
     */
    @GetMapping("/banner/stickers")
    public ResponseEntity<List<BannerSticker>> getBannerStickers() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return ResponseEntity.ok(bannerStickerService.getUserBannerStickers(user.getId()));
    }

    /**
     * 배너 스티커 위치 업데이트
     */
    @PutMapping("/banner/sticker/{bannerStickerId}")
    public ResponseEntity<BannerSticker> updateStickerPosition(
            @PathVariable Long bannerStickerId,
            @RequestBody Map<String, Object> request) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        Double positionX = ((Number) request.get("positionX")).doubleValue();
        Double positionY = ((Number) request.get("positionY")).doubleValue();
        Double width = ((Number) request.get("width")).doubleValue();
        Double height = ((Number) request.get("height")).doubleValue();
        
        BannerSticker result = bannerStickerService.updateStickerPosition(
            user.getId(), bannerStickerId, positionX, positionY, width, height);
        return ResponseEntity.ok(result);
    }
}

