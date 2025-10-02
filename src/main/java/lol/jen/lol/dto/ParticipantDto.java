package lol.jen.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Match-v5 API 호출 : matchId -> 해당 경기 참가자들 정보 얻음
 */
// src/main/java/lol/jen/lol/dto/ParticipantDto.java
@Getter @Setter @ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParticipantDto {
    private String puuid;                 // ✅ 추가
    private String summonerName;          // 표시용 (fallback)
    private String riotIdGameName;        // ✅ 선택: 표준 Riot ID
    private String riotIdTagline;         // ✅ 선택

    private String championName;
    private int teamId;
    private int kills;
    private int deaths;
    private int assists;
    private int totalMinionsKilled;
    private int champLevel;
    private int goldEarned;
    private boolean win;
}