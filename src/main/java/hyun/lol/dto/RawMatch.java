package hyun.lol.dto;

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
        private String matchId;            // 해당 경기의 고유 Id
        private List<String> participants; // puuid list
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        private long gameCreation;     // 게임 시작 시간
        private long gameDuration;     // 경기 시간( 초단위 )
        private String gameMode;       // CLASSIC( 협곡 ), cherry( 아레나 ), ARAM( 칼바람 ), URF( 우르프 ), TUTORIAL_MODULE_*( 튜토리얼 )
        private String gameVersion;    // 현재 패치 버전
        private Integer queueId;       // 큐 타입 Id, 400 = 일반 (블라인드), 420 = 솔랭, 430 = 일반(드래프트), 440 = 자랭, 450 = ARAM
        private List<Participant> participants;
    }

    // src/main/java/lol/jen/lol/dto/RawMatch.java
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Participant {
        private String puuid;                 // ✅ 추가
        private String riotIdGameName;        // ✅ 선택: 더 정확한 이름
        private String riotIdTagline;         // ✅ 선택: 태그
        private String summonerName;          // 위 riotIdGameName,TagLine이 없는 경우 이 필드로 닉네임 사용, 보통은 "" 임

        private String championName;
        private Integer teamId;               // 블루팀은 100, 레드팀은 200
        private Integer kills;                // 킬
        private Integer deaths;               // 데스
        private Integer assists;              // 어시
        private Integer totalMinionsKilled;   // 미니언 킬 수
        private Integer neutralMinionsKilled; // 정글 몬스터 + 오브젝트 몬스터 킬 수
        private Integer champLevel;           // 챔피언 레벨
        private Integer goldEarned;           // 골드량
        private Boolean win;                  // 승리팀인지 아닌 지

        private Integer summoner1Id, summoner2Id;                  // 소환사 주문 ( D/F )
        private Integer item0,item1,item2,item3,item4,item5,item6; // 인벤토리 아이템 (0~5 = 장비, 6 = 장신구)
        private Integer largestMultiKill;                          // 멀티킬 ( 2=더블, 3=트리플, 4=쿼드라, 5=펜타)

        private Perks perks;                                       // 룬, 특성 정보(Perks)
    }
}