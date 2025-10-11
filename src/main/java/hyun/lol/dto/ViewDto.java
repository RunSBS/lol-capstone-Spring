package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 프론트로 넘겨줄 View용 Dto이다.
 * AccountDto 와 SummonerDto의 내용이 합쳐짐
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ViewDto {
    // AccountDto 의 필드
    // 소환사의 글로벌 고유 Id
    private String puuid;
    // 닉네임
    private String gameName;
    // 태그
    private String tagLine;

    // SummonerDto 의 필드
    // 프로필에 표시되는 아이콘의 정수ID, Data Dragon에서 이미지로 랜더링됨.
    private Integer profileIconId;
    // 이 소환사의 데이터가 마지막으로 변경된 시각
    private Long revisionDate;
    // 소환사 계정 레벨
    private Long summonerLevel;

    // League - 큐 타입별 단일 엔트리
    private LeagueEntryDto soloRanked;   // RANKED_SOLO_5x5
    private LeagueEntryDto flexRanked;   // RANKED_FLEX_SR
    private LeagueEntryDto tftRanked;    // RANKED_TFT
}
