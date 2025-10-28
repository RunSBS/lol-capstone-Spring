package hyun.lol.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

/**
 * 매치 상세 정보 (MatchDto + 팀 정보)
 * - MatchDto를 포함하여 중복 제거
 * - 팀별 오브젝트 획득 정보 포함
 */
@Value
@Builder
public class MatchDetailDto {
    MatchDto match;               // 기본 매치 정보 (재사용)
    List<TeamDto> teams;         // 팀 정보 (100 / 200)

    /** 팀 정보 */
    @Value @Builder public static class TeamDto {
        int teamId;               // 100(블루팀) or 200(레드팀)
        boolean win;              // 승리 여부
        TeamObjectives objectives; // 오브젝트 획득 정보
        Integer championKills;    // 킬 수
    }

    /** 팀 오브젝트 획득 정보 */
    @Value @Builder public static class TeamObjectives {
        int baron;        // 바론 획득 수
        int dragon;      // 드래곤 획득 수
        int tower;       // 타워 파괴 수
        int inhibitor;   // 억제기 파괴 수
        int riftHerald;  // 전령 획득 수
    }
}