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
        
        // POSTS 테이블에 CONTENT_B 컬럼 추가 (없는 경우)
        try {
            String checkColumnSql = "SELECT COUNT(*) FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'POSTS' AND COLUMN_NAME = 'CONTENT_B'";
            int columnCount = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            
            if (columnCount == 0) {
                jdbcTemplate.execute("ALTER TABLE POSTS ADD (CONTENT_B CLOB)");
                log.info("Added column CONTENT_B to POSTS table");
            } else {
                log.info("Column CONTENT_B already exists in POSTS table");
            }
        } catch (Exception e) {
            log.error("Failed to add CONTENT_B column to POSTS table: {}", e.getMessage());
        }
        
        // 모든 DATE 컬럼을 TIMESTAMP로 변환
        convertDateToTimestamp("USERS", "CREATED_AT");
        convertDateToTimestamp("POSTS", "CREATED_AT");
        convertDateToTimestamp("POSTS", "UPDATED_AT");
        convertDateToTimestamp("COMMENTS", "CREATED_AT");
        convertDateToTimestamp("BETS", "DEADLINE");
        convertDateToTimestamp("BETS", "CREATED_AT");
        convertDateToTimestamp("BET_VOTES", "CREATED_AT");
        convertDateToTimestamp("BET_SETTLEMENTS", "SETTLED_AT");
        convertDateToTimestamp("POST_MEDIA", "CREATED_AT");
    }
    
    private void convertDateToTimestamp(String tableName, String columnName) {
        try {
            // 컬럼의 데이터 타입 확인
            String checkTypeSql = "SELECT DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?";
            String dataType = jdbcTemplate.queryForObject(checkTypeSql, String.class, tableName, columnName);
            
            // TIMESTAMP WITH TIME ZONE이 아닌 경우 변환
            if (dataType != null && !dataType.contains("TIME ZONE")) {
                // DATE 또는 TIMESTAMP를 TIMESTAMP WITH TIME ZONE으로 변환 (임시 컬럼 사용)
                jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD (" + columnName + "_TEMP TIMESTAMP WITH TIME ZONE)");
                jdbcTemplate.execute("UPDATE " + tableName + " SET " + columnName + "_TEMP = " + columnName);
                jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP COLUMN " + columnName);
                jdbcTemplate.execute("ALTER TABLE " + tableName + " RENAME COLUMN " + columnName + "_TEMP TO " + columnName);
                log.info("Converted {}.{} from {} to TIMESTAMP WITH TIME ZONE", tableName, columnName, dataType);
            } else {
                log.info("{}.{} is already TIMESTAMP WITH TIME ZONE: {}", tableName, columnName, dataType);
            }
        } catch (Exception e) {
            log.error("Failed to convert {}.{} to TIMESTAMP WITH TIME ZONE: {}", tableName, columnName, e.getMessage());
        }
    }
}

