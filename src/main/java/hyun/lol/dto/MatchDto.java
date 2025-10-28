package hyun.lol.dto;

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
    private String gameMode;       // 모드 (CLASSIC, ARAM 등)
    private Integer queueId;       // 솔랭이면 420, 자유랭 440, 일반 400(블라인드), 430 등 경기 종류
    private List<ParticipantDto> participants; // 참가자들
}
