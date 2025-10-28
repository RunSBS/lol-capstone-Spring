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
/**
 * Match-v5 API 호출 : 히스토리 리스트용 기본 정보
 * - 팀 리스트: 닉네임 + 챔피언만 표시
 * - 메인 참가자(뷰어): 상세 정보 표시
 */
@Getter @Setter @ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParticipantDto {
    // 팀 리스트 표시용 (모든 참가자)
    private String puuid;
    private String riotIdGameName;
    private String summonerName;
    private String championName;
    private int teamId;                // 100=블루, 200=레드
    
    // 메인 참가자(뷰어) 전용 상세 정보
    private boolean win;
    private int kills, deaths, assists;
    private int champLevel;
    private int csTotal;
    private Integer summoner1Id, summoner2Id;
    private Integer primaryStyleId, subStyleId;
    private Integer keystoneId;
    private List<Integer> perkIds;
    private Integer item0, item1, item2, item3, item4, item5, item6;
    private int totalDamageDealtToChampions;
    private int totalDamageTaken;
}