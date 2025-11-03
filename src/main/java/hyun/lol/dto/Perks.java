package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * 룬/특성 정보 (Riot API)
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Perks {
    private StatPerks statPerks;  // 스탯 룬 (공격/방어/유연)
    private List<Style> styles;   // 룬 스타일 (메인/서브)

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatPerks {
        private Integer offense;   // 공격 스탯
        private Integer flex;      // 유연 스탯
        private Integer defense;   // 방어 스탯
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Style {
        private String description;    // "primaryStyle" or "subStyle"
        private Integer style;        // 8000=정밀, 8100=지배, 8200=마법, 8300=영감, 8400=결의
        private List<Selection> selections;  // 선택한 룬들
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Selection {
        private Integer perk;       // 룬 ID (예: 8112=감전)
        private Integer var1, var2, var3;  // 룬 변수
    }
}