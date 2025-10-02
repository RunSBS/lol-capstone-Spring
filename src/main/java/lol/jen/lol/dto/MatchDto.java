package lol.jen.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
/**
 * Match-v5 API 호출 : puuid -> 매치 정보 얻음
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class MatchDto {
    private String matchId;        // 매치 ID
    private long gameCreation;     // 생성 시각
    private long gameDuration;     // 경기 시간 (초)
    private String gameMode;       // 모드 (CLASSIC 등)
    private String gameVersion;    // 버전
    private List<ParticipantDto> participants; // 참가자들
}
