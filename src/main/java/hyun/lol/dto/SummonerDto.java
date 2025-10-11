package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
/**
 * Summoner-v4 API 호출 : puuid로 Summoner 얻음
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class SummonerDto {
    // 소환사의 글로벌 고유 Id
    private String puuid;
    // 프로필에 표시되는 아이콘의 정수ID, Data Dragon에서 이미지로 랜더링됨.
    private Integer profileIconId;
    // 이 소환사의 데이터가 마지막으로 변경된 시각
    private Long revisionDate;
    // 소환사 계정 레벨
    private Long summonerLevel;
}
