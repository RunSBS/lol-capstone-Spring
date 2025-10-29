package hyun.lol.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

/**
 * 매치 상세 정보 (MatchSummaryDto + 팀 정보)
 * - MatchDto 구조를 따르되, 상세보기에 필요한 필드만 포함
 * - MatchSummaryDto를 포함하여 중복 제거
 * - 팀별 오브젝트 획득 정보 포함
 */
@Value
@Builder
public class MatchDetailDto {
    MatchSummaryDto match;               // 기본 매치 정보 (MatchDto 구조 반영, 재사용)
    List<TeamDto> teams;         // 팀 정보 (100 / 200) - MatchDto.Team 구조 반영

    /** 팀 정보 (MatchDto.Team 구조 반영) */
    @Value @Builder public static class TeamDto {
        Integer teamId;          // 100(블루팀) or 200(레드팀)
        Boolean win;             // 승리 여부
        TeamObjectives objectives; // 오브젝트 획득 정보 (MatchDto.Objectives 구조 반영)
        Integer championKills;   // 킬 수 (objectives.champion.kills에서 추출)
    }

    /** 팀 오브젝트 획득 정보 (MatchDto.Objectives 구조 반영) */
    @Value @Builder public static class TeamObjectives {
        ObjectiveStat baron;       // 바론 (MatchDto.ObjectiveStat 구조)
        ObjectiveStat dragon;      // 드래곤
        ObjectiveStat tower;       // 타워
        ObjectiveStat inhibitor;   // 억제기
        ObjectiveStat riftHerald;  // 전령
        ObjectiveStat champion;    // 챔피언 킬
    }

    /** 오브젝트 통계 (MatchDto.ObjectiveStat 구조 반영) */
    @Value @Builder public static class ObjectiveStat {
        Integer kills;  // 획득/파괴 수
    }
}