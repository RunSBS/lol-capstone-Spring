package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * Match-v5 API 호출 : matchId -> 해당 경기 참가자들 정보 얻음
 */
// src/main/java/lol/jen/lol/dto/ParticipantDto.java
@Getter @Setter @ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParticipantDto {
    // 식별/표시
    private String puuid;
    private String riotIdGameName;
    private String riotIdTagline;
    private String summonerName;

    // 기본 전적
    private String championName;
    private int teamId;                // 100=블루, 200=레드
    private int kills, deaths, assists;
    private int champLevel;
    private int goldEarned;
    private boolean win;

    // CS
    private int csTotal;               // totalMinionsKilled + neutralMinionsKilled

    // 주문/룬/아이템
    private Integer summoner1Id, summoner2Id;
    // ★ 추가: 메인/서브 스타일 + 메인 키스톤 + 전체 선택 룬 ID들
    private Integer primaryStyleId, subStyleId;
    private Integer keystoneId;          // primaryStyle의 selections[0].perk
    private List<Integer> perkIds;       // 모든 selections의 perk id
    private Integer item0, item1, item2, item3, item4, item5, item6;

    // 배지(멀티킬)
    private Integer largestMultiKill;
}