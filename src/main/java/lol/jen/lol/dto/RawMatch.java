package lol.jen.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RawMatch {
    private Metadata metadata;
    private Info info;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        private String matchId;
        private List<String> participants; // puuid list
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        private long gameCreation;     // epoch ms
        private long gameDuration;     // seconds
        private String gameMode;       // CLASSIC 등
        private String gameVersion;
        private List<Participant> participants;
    }

    // src/main/java/lol/jen/lol/dto/RawMatch.java
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Participant {
        private String puuid;                 // ✅ 추가
        private String riotIdGameName;        // ✅ 선택: 더 정확한 이름
        private String riotIdTagline;         // ✅ 선택: 태그
        private String summonerName;

        private String championName;
        private Integer teamId;
        private Integer kills;
        private Integer deaths;
        private Integer assists;
        private Integer totalMinionsKilled;
        private Integer neutralMinionsKilled;
        private Integer champLevel;
        private Integer goldEarned;
        private Boolean win;
    }

}