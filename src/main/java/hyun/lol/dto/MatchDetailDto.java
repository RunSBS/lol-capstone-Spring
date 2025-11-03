package hyun.lol.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

/**
 * 매치 상세 정보 (Metadata + Info)
 * - MatchDto 구조(메타데이터/인포)를 따르되, 상세보기에 필요한 필드만 포함
 * - Info 내부에 팀 정보(teams)를 포함하여, Team 관련 필드가 Info에 속함을 명확히 표현
 */
@Value
@Builder
public class MatchDetailDto {
    MatchSummaryDto.Metadata metadata;  // 매치 메타데이터 (matchId 등)
    Info info;                          // 상세 인포(요약 정보 + 팀 정보)

    /** 상세 인포 (전적 요약 + 팀 정보) */
    @Value @Builder public static class Info {
        long gameCreation;                 // 생성 시각
        long gameDuration;                 // 경기 시간 (초)
        String gameMode;                   // 모드 (CLASSIC, ARAM 등)
        Integer queueId;                   // 큐 타입
        List<ParticipantDto> participants; // 참가자들 (10명)
        List<TeamDto> teams;               // 팀 정보 (100 / 200)

        /** 팀 정보 (MatchDto.Team 구조 반영) */
        @Value @Builder public static class TeamDto {
            Integer teamId;            // 100(블루팀) or 200(레드팀)
            Boolean win;               // 승리 여부
            TeamObjectives objectives; // 오브젝트 획득 정보 (MatchDto.Objectives 구조 반영)
            Integer championKills;     // 킬 수 (objectives.champion.kills에서 추출)
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
}