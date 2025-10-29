package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * 전적 목록 카드용 DTO (MatchDto에서 필요한 필드만 추출)
 * - MatchDto 구조를 따르되, 전적 목록 카드에 필요한 필드만 포함
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class MatchSummaryDto {
    private Metadata metadata;
    private Info info;

    /** 메타데이터 (MatchDto.Metadata에서 필요한 필드만) */
    @Getter
    @Setter
    @ToString
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        private String matchId;  // 매치 ID (전적 목록 카드에 필요)
    }

    /** 매치 정보 (MatchDto.Info에서 필요한 필드만) */
    @Getter
    @Setter
    @ToString
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        private long gameCreation;     // 생성 시각
        private long gameDuration;     // 경기 시간 (초)
        private String gameMode;       // 모드 (CLASSIC, ARAM 등)
        private Integer queueId;       // 솔랭이면 420, 자유랭 440, 일반 400(블라인드), 430 등 경기 종류
        private List<ParticipantDto> participants; // 참가자들
    }
}

