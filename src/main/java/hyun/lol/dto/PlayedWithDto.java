package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 함께 플레이한 소환사 정보 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlayedWithDto {
    private String name;           // 게임 이름
    private String tag;            // 태그
    private Integer level;         // 소환사 레벨
    private String iconUrl;       // 프로필 아이콘 URL
    private String games;          // 게임 수 문자열 (예: "6승 / 6패")
    private Integer winrate;       // 승률 (정수, 예: 50)
    
    // 내부 계산용 (필요시 사용)
    private Integer wins;
    private Integer losses;
}

