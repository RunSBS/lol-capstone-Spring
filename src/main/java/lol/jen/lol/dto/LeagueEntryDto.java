package lol.jen.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * League-v4 API 호출 : ..
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class LeagueEntryDto {
    private String leagueId; // 리그의 고유 id : 골드4 중에서도 어느 리그인 지
    private String puuid;
    private String queueType; // 모드 종류 : 솔랭, 자유랭, TFT
    private String tier; // 티어 : 골드, 플레 등
    private String rank; // 티어 세부 단계 : "I", "II", "III", "IV"
    private int leaguePoints; // 몇 점인 지
    private int wins; // 총 승수
    private int losses; // 총 패배수
    private boolean hotStreak; // 최근 3연승 이상이면 true
    private boolean veteran; // 베테랑 : 해당 시즌(이번시즌)에 많이 한 유저면 true
    private boolean freshBlood; // 해당 leagueId에 최근 진입했으면 true
    private boolean inactive; // 현재 리그활동을 안 하는 계정이면 true
    private MiniSeriesDto miniSeries; // 승급전 중인 지 나타내는 Dto
}
