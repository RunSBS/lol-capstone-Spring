package hyun.db.repo;

import hyun.db.entity.BannerSticker;
import hyun.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerStickerRepository extends JpaRepository<BannerSticker, Long> {
    List<BannerSticker> findByUser(User user);
    void deleteByUserAndId(User user, Long id);
}

