package hyun.auth.service;

import hyun.db.entity.BannerSticker;
import hyun.db.entity.ShopItem;
import hyun.db.entity.User;
import hyun.db.entity.UserItem;
import hyun.db.repo.BannerStickerRepository;
import hyun.db.repo.ShopItemRepository;
import hyun.db.repo.UserItemRepository;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
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
public class BannerStickerService {
    private final BannerStickerRepository bannerStickerRepository;
    private final UserRepository userRepository;
    private final ShopItemRepository shopItemRepository;
    private final UserItemRepository userItemRepository;

    /**
     * 배너에 스티커 부착
     */
    @Transactional
    public BannerSticker addStickerToBanner(Long userId, String itemCode, 
                                            Double positionX, Double positionY, 
                                            Double width, Double height) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        ShopItem stickerItem = shopItemRepository.findByItemCode(itemCode)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "스티커를 찾을 수 없습니다."));
        
        if (!"STICKER".equals(stickerItem.getItemType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "스티커 타입이 아닙니다.");
        }
        
        // 보유 여부 확인
        UserItem userItem = userItemRepository.findByUserAndShopItem(user, stickerItem)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "보유하지 않은 스티커입니다."));
        
        if (userItem.getQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "보유 수량이 부족합니다.");
        }
        
        // 스티커 부착
        BannerSticker bannerSticker = new BannerSticker();
        bannerSticker.setUser(user);
        bannerSticker.setShopItem(stickerItem);
        bannerSticker.setPositionX(positionX);
        bannerSticker.setPositionY(positionY);
        bannerSticker.setWidth(width);
        bannerSticker.setHeight(height);
        bannerSticker.setCreatedAt(LocalDateTime.now());
        bannerStickerRepository.save(bannerSticker);
        
        // 인벤토리에서 수량 차감 (소모형)
        userItem.setQuantity(userItem.getQuantity() - 1);
        if (userItem.getQuantity() == 0) {
            userItemRepository.delete(userItem);
        } else {
            userItemRepository.save(userItem);
        }
        
        log.info("스티커 부착 완료: userId={}, itemCode={}, position=({},{})", 
            userId, itemCode, positionX, positionY);
        
        return bannerSticker;
    }

    /**
     * 배너에서 스티커 제거
     */
    @Transactional
    public void removeStickerFromBanner(Long userId, Long bannerStickerId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        BannerSticker bannerSticker = bannerStickerRepository.findById(bannerStickerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "스티커를 찾을 수 없습니다."));
        
        if (!bannerSticker.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 스티커만 제거할 수 있습니다.");
        }
        
        bannerStickerRepository.delete(bannerSticker);
        
        log.info("스티커 제거 완료: userId={}, bannerStickerId={}", userId, bannerStickerId);
    }

    /**
     * 사용자의 배너 스티커 목록 조회
     */
    public List<BannerSticker> getUserBannerStickers(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        return bannerStickerRepository.findByUser(user);
    }

    /**
     * 배너 스티커 위치 업데이트
     */
    @Transactional
    public BannerSticker updateStickerPosition(Long userId, Long bannerStickerId,
                                               Double positionX, Double positionY,
                                               Double width, Double height) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        
        BannerSticker bannerSticker = bannerStickerRepository.findById(bannerStickerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "스티커를 찾을 수 없습니다."));
        
        if (!bannerSticker.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 스티커만 수정할 수 있습니다.");
        }
        
        bannerSticker.setPositionX(positionX);
        bannerSticker.setPositionY(positionY);
        bannerSticker.setWidth(width);
        bannerSticker.setHeight(height);
        bannerStickerRepository.save(bannerSticker);
        
        return bannerSticker;
    }
}

