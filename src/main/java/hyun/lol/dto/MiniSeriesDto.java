package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * League-v4 API 호출 : LeagueEntryDto > MiniSeriesDto
 * 승급전에서의 승수등을 기록
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class MiniSeriesDto {
    private int wins; // 승급전중 승리한 판 수 ex) 3판 2선중 0, 1 or 5판 3선중 0, 1, 2
    private int losses; // 승급전 중 패배한 판 수
    private int target; // 승리해야하는 판 수
    private String progress; // 승급전 진행률을 문자열로 기록, 승리는 W 패배 L 아직 안했으면 N
    // -> 3판2선중 승패 2판 했다면 WLN, 승급결과가 나온 순간 없어지기에 WW나 WLW같은 결과는 기록될 일이 없음
}
