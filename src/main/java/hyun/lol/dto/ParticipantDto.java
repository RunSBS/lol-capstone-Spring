package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

/**
 * 매치 참가자 정보 DTO
 * - MatchDto와 MatchDetailDto에서 공통으로 사용
 * - 팀 리스트 표시용 필수 정보 + 메인 참가자(뷰어) 상세 정보 포함
 */
@Getter @Setter @ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParticipantDto {
    // ===== 팀 리스트 표시용 (10명 모두 공통) =====
    private String puuid;              // 고유 ID (백엔드에서 메인 참가자 찾기용)
    private String riotIdGameName;     // 게임 닉네임
    private String riotIdTagline;      // 게임 태그라인
    private String summonerName;       // 소환사 이름
    private String championName;        // 플레이한 챔피언
    private int teamId;                // 100=블루팀, 200=레드팀
    private String teamPosition;       // 팀 포지션 (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
    private String individualPosition; // 개별 포지션 (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)
    
    // ===== 메인 참가자(뷰어) 전용 상세 정보 =====
    private boolean win;                // 승리 여부
    private int kills, deaths, assists; // K/D/A
    private int champLevel;             // 챔피언 레벨
    private int csTotal;                // CS (미니언 + 정글)
    
    // 스펠/룬
    private Integer summoner1Id;        // 첫 번째 소환사 주문
    private Integer summoner2Id;        // 두 번째 소환사 주문
    private Integer primaryStyleId;     // 메인 룬 스타일
    private Integer subStyleId;         // 서브 룬 스타일
    private Integer keystoneId;         // 키스톤 룬
    private List<Integer> perkIds;      // 모든 룬 ID 리스트
    
    // 아이템 슬롯 (0~6)
    private Integer item0, item1, item2, item3, item4, item5, item6;
    
    // 전투 통계
    private int totalDamageDealtToChampions;  // 챔피언에게 가한 총 피해
    private int totalDamageTaken;             // 받은 총 피해
    private Double killParticipation;         // 킬관여율 (0.0~1.0 또는 0~100 형태, 백엔드에서는 0.0~1.0)
    
    // 골드 통계
    private Integer goldEarned;               // 획득한 골드
}