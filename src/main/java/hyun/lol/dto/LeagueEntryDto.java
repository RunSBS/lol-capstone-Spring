package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 랭크 정보 DTO (League-v4 API)
 * - puuid로 소환사의 솔로랭크/자유랭크/TFT 정보 조회
 * - ViewDto에 포함되어 프론트엔드로 전달
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class LeagueEntryDto {
    // 기본 정보
    private String leagueId;       // 리그 고유 ID (골드4 중에서도 어느 리그인지)
    private String puuid;          // 소환사 고유 ID
    private String queueType;      // RANKED_SOLO_5x5(솔로), RANKED_FLEX_SR(자유), RANKED_TFT
    private String tier;           // IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
    private String rank;           // I, II, III, IV (MASTER 이상은 null)
    private int leaguePoints;      // LP (League Points)
    
    // 전적
    private int wins;              // 총 승수
    private int losses;            // 총 패배수
    private boolean hotStreak;     // 최근 3연승 이상이면 true
    
    // 계정 상태
    private boolean veteran;       // 이번 시즌에 많이 플레이한 유저
    private boolean freshBlood;    // 해당 리그에 최근 진입
    private boolean inactive;      // 리그 활동을 안 하는 계정
    
    private MiniSeriesDto miniSeries;  // 승급전 정보 (진행 중일 때만)
}
