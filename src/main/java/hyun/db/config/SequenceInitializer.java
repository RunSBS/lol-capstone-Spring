package hyun.db.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;

@Slf4j
@Component  // DB 연결 실패 시 비활성화
@RequiredArgsConstructor
public class SequenceInitializer {
    private final JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void createSequences() {
        String[] sequences = {
            "USERS_SEQ", "POSTS_SEQ", "COMMENTS_SEQ", "BETS_SEQ", 
            "BET_VOTES_SEQ", "BET_SETTLEMENTS_SEQ", "POST_REACTION_SEQ",
            "SHOP_ITEMS_SEQ", "USER_ITEMS_SEQ", "BANNER_STICKERS_SEQ",
            "PURCHASE_HISTORY_SEQ", "TOKEN_TRANSACTIONS_SEQ", "POST_MEDIA_SEQ"
        };
        
        for (String seqName : sequences) {
            try {
                // SEQUENCE가 존재하는지 확인
                String checkSql = "SELECT COUNT(*) FROM USER_SEQUENCES WHERE SEQUENCE_NAME = '" + seqName + "'";
                int count = jdbcTemplate.queryForObject(checkSql, Integer.class);
                
                if (count == 0) {
                    // SEQUENCE가 없으면 생성
                    jdbcTemplate.execute("CREATE SEQUENCE " + seqName + " START WITH 1 INCREMENT BY 1");
                    log.info("Created sequence: {}", seqName);
                } else {
                    log.info("Sequence already exists: {}", seqName);
                }
            } catch (Exception e) {
                log.error("Failed to create sequence {}: {}", seqName, e.getMessage());
            }
        }
    }
}

