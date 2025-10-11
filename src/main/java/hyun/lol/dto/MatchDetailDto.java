// src/main/java/lol/jen/lol/dto/MatchDetailDto.java
package hyun.lol.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class MatchDetailDto {
    String matchId;
    long gameCreation;   // ms
    long gameDuration;   // sec (주의: Riot 값은 패치에 따라 ms/sec 혼용돼서 보정 필요)
    Integer queueId;
    String gameMode;

    List<TeamDto> teams;           // 100 / 200
    List<ParticipantDetailDto> participants; // 10명

    // 파생 지표 (프론트 편의)
    // 주의: 계산은 서비스에서 해줌
    @Value @Builder public static class TeamDto {
        int teamId;       // 100 or 200
        boolean win;
        TeamObjectives objectives;
        Integer championKills; // team total kills (objective.champion.kills와 동일)
    }

    @Value @Builder public static class TeamObjectives {
        int baron;
        int dragon;
        int tower;
        int inhibitor;
        int riftHerald;
    }

    @Value
    @Builder
    public static class ParticipantDetailDto {
        int participantId;    // 1~10
        int teamId;           // 100 / 200

        String puuid;
        String summonerName;

        String championName;
        Integer championId;
        String role;          // TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY 등
        String lane;          // TOP/JUNGLE/MID/BOT 등 Riot 필드 그대로

        // 스펠/룬/아이템
        Integer spell1Id;
        Integer spell2Id;

        // primaryStyle, subStyle, 주요 키스톤/선택룬 id
        Integer perkPrimaryStyle;
        Integer perkSubStyle;
        List<Integer> perkIds;

        // 전투/시야/경제/CS
        int kills;
        int deaths;
        int assists;
        int totalDamageDealtToChampions;
        int totalDamageTaken;
        int visionScore;
        int wardsPlaced;
        int wardsKilled;
        int goldEarned;
        int cs; // totalMinionsKilled + neutralMinionsKilled

        // 아이템 슬롯 (0~6)
        Integer item0; Integer item1; Integer item2;
        Integer item3; Integer item4; Integer item5; Integer item6;

        // 파생 지표
        Double kda;                // deaths==0 처리 포함
        Double killParticipation;  // (k+a)/teamKills
        Double dpm;                // damage per minute (선택)
    }
}