package hyun.lol.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

/**
 * 매치 상세 정보 (MatchDto + 팀 정보)
 */
@Value
@Builder
public class MatchDetailDto {
    MatchDto match;               // 기본 매치 정보 (재사용)
    List<TeamDto> teams;         // 팀 정보 (100 / 200)

    @Value @Builder public static class TeamDto {
        int teamId;               // 100 or 200
        boolean win;
        TeamObjectives objectives;
        Integer championKills;
    }

    @Value @Builder public static class TeamObjectives {
        int baron;
        int dragon;
        int tower;
        int inhibitor;
        int riftHerald;
    }
}