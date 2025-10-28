package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

/**
 * Riot API 원시 매치 응답 DTO
 * - API 응답을 그대로 받기 위한 임시 DTO
 * - MatchDto로 변환되어 사용됨
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RawMatch {
    private Metadata metadata;  // 메타데이터 (matchId, participants)
    private Info info;         // 매치 정보 (게임 정보, 참가자 데이터)

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        private String matchId;            // 매치 고유 ID
        private List<String> participants; // 참가자 puuid 리스트
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        private long gameCreation;     // 게임 시작 시간 (타임스탬프)
        private long gameDuration;     // 게임 시간 (초)
        private String gameMode;       // CLASSIC, ARAM, URF 등
        private String gameVersion;    // 게임 버전
        private Integer queueId;       // 420(솔로), 440(자유), 450(ARAM) 등
        private List<Participant> participants; // 참가자 10명
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Participant {
        // 식별 정보
        private String puuid;
        private String riotIdGameName;
        private String riotIdTagline;
        private String summonerName;
        private String championName;
        
        // 기본 정보
        private Integer teamId;               // 100=블루팀, 200=레드팀
        private Integer kills, deaths, assists; // K/D/A
        private Integer champLevel;
        private Boolean win;                  // 승리 여부
        
        // CS/경제
        private Integer totalMinionsKilled;   // 미니언 킬
        private Integer neutralMinionsKilled; // 정글 몬스터 킬
        private Integer goldEarned;           // 획득 골드
        
        // 스펠/아이템
        private Integer summoner1Id, summoner2Id; // 소환사 주문
        private Integer item0, item1, item2, item3, item4, item5, item6; // 아이템 슬롯
        
        // 통계
        private Integer largestMultiKill;     // 멀티킬 (2=더블, 3=트리플, 4=쿼드, 5=펜타)
        private Integer totalDamageDealtToChampions; // 챔피언에게 가한 피해
        private Integer totalDamageTaken;             // 받은 피해
        
        private Perks perks;                   // 룬 정보
    }
}