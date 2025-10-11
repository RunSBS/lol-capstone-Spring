package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Perks {
    private StatPerks statPerks;
    private List<Style> styles;

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatPerks {
        private Integer offense;
        private Integer flex;
        private Integer defense;
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Style {
        private String description;     // "primaryStyle" or "subStyle"
        private Integer style;          // 8000=정밀, 8100=지배, 8200=마법, 8300=영감, 8400=결의
        private List<Selection> selections;
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Selection {
        private Integer perk;           // 실제 룬 ID (예: 8112=감전)
        private Integer var1, var2, var3;
    }
}