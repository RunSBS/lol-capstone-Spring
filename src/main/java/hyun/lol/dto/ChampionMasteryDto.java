package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 챔피언 숙련도 정보 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChampionMasteryDto {
    private Long championId;
    private Integer championLevel;
    private Integer championPoints;
    private Long championPointsSinceLastLevel;
    private Long championPointsUntilNextLevel;
    private Boolean chestGranted;
    private Integer tokensEarned;
    private String summonerId;
    
    // 프론트엔드용 추가 필드 (서비스에서 설정)
    private String name;
    private String imageUrl;
    private String points; // 포맷된 포인트 문자열 (예: "86,541")
}

