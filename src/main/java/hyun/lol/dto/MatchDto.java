package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

/**
 * Riot Match-v5 API 응답 구조 (공식 DTO 이름 사용)
 * - GET /lol/match/v5/matches/{matchId} 응답을 그대로 반영
 * - metadata + info 구조
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MatchDto {
    /** 경기 메타데이터 (데이터 버전, 매치 ID, 참가자 목록) */
    private Metadata metadata;
        /** 경기 상세 정보 (게임 정보, 참가자 데이터, 팀 정보) */
    private Info info;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        /** 데이터 버전 (예: "2") */
        private String dataVersion;
        /** 매치 고유 ID (예: "KR_7858254806") */
        private String matchId;
        /** 참가자들의 PUUID 목록 */
        private List<String> participants;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Info {
        /** 게임 종료 결과 (예: "GameComplete") */
        private String endOfGameResult;
        /** 게임 생성 시간 (Unix 타임스탬프, 밀리초) */
        private Long gameCreation;
        /** 게임 지속 시간 (초) */
        private Long gameDuration;
        /** 게임 종료 시간 (Unix 타임스탬프, 밀리초) */
        private Long gameEndTimestamp;
        /** 게임 고유 ID */
        private Long gameId;
        /** 게임 모드 (예: "CLASSIC", "ARAM", "CHERRY", "URF") */
        private String gameMode;
        /** 게임 이름 (예: "teambuilder-match-7858254806") */
        private String gameName;
        /** 게임 시작 시간 (Unix 타임스탬프, 밀리초) */
        private Long gameStartTimestamp;
        /** 게임 타입 (예: "MATCHED_GAME", "CUSTOM_GAME") */
        private String gameType;
        /** 게임 버전 (예: "15.20.717.2831") */
        private String gameVersion;
        /** 맵 ID (11 = 소환사의 협곡, 12 = 칼바람 나락 등) */
        private Integer mapId;
        /** 참가자 정보 목록 (10명) */
        private List<Participant> participants;
        /** 플랫폼 ID (예: "KR", "NA1", "EUW1") */
        private String platformId;
        /** 큐 타입 ID (400=일반블라인드, 420=솔랭, 430=일반드래프트, 440=자랭, 450=ARAM) */
        private Integer queueId;
        /** 팀 정보 목록 (100=블루팀, 200=레드팀) */
        private List<Team> teams;
        /** 토너먼트 코드 (토너먼트 게임인 경우) */
        private String tournamentCode;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Participant {
        /** 플레이어 점수 0 (미션 점수) */
        private Integer PlayerScore0;
        /** 플레이어 점수 1 (미션 점수) */
        private Integer PlayerScore1;
        /** 플레이어 점수 2 (미션 점수) */
        private Integer PlayerScore2;
        /** 플레이어 점수 3 (미션 점수) */
        private Integer PlayerScore3;
        /** 플레이어 점수 4 (미션 점수) */
        private Integer PlayerScore4;
        /** 플레이어 점수 5 (미션 점수) */
        private Integer PlayerScore5;
        /** 플레이어 점수 6 (미션 점수) */
        private Integer PlayerScore6;
        /** 플레이어 점수 7 (미션 점수) */
        private Integer PlayerScore7;
        /** 플레이어 점수 8 (미션 점수) */
        private Integer PlayerScore8;
        /** 플레이어 점수 9 (미션 점수) */
        private Integer PlayerScore9;
        /** 플레이어 점수 10 (미션 점수) */
        private Integer PlayerScore10;
        /** 플레이어 점수 11 (미션 점수) */
        private Integer PlayerScore11;
        /** 올인 핑 횟수 */
        private Integer allInPings;
        /** 도와달라 핑 횟수 */
        private Integer assistMePings;
        /** 어시스트 수 */
        private Integer assists;
        /** 바론 킬 수 */
        private Integer baronKills;
        /** 기본 핑 횟수 */
        private Integer basicPings;
        /** 도전 과제 정보 */
        private Challenges challenges;
        /** 챔피언 경험치 */
        private Integer champExperience;
        /** 챔피언 레벨 */
        private Integer champLevel;
        /** 챔피언 ID */
        private Integer championId;
        /** 챔피언 이름 */
        private String championName;
        /** 챔피언 변신 상태 (특정 챔피언의 변신 형태) */
        private Integer championTransform;
        /** 지시 핑 횟수 */
        private Integer commandPings;
        /** 소모품 구매 수 */
        private Integer consumablesPurchased;
        /** 건물에 가한 피해 */
        private Integer damageDealtToBuildings;
        /** 오브젝트에 가한 피해 */
        private Integer damageDealtToObjectives;
        /** 포탑에 가한 피해 */
        private Integer damageDealtToTurrets;
        /** 자가 완화한 피해 */
        private Integer damageSelfMitigated;
        /** 위험 핑 횟수 */
        private Integer dangerPings;
        /** 죽은 횟수 */
        private Integer deaths;
        /** 제어 와드 설치 수 */
        private Integer detectorWardsPlaced;
        /** 더블킬 횟수 */
        private Integer doubleKills;
        /** 드래곤 킬 수 */
        private Integer dragonKills;
        /** 진행 가능 여부 */
        private Boolean eligibleForProgression;
        /** 적 실종 핑 횟수 */
        private Integer enemyMissingPings;
        /** 적 시야 핑 횟수 */
        private Integer enemyVisionPings;
        /** 퍼스트블러드 어시스트 여부 */
        private Boolean firstBloodAssist;
        /** 퍼스트블러드 킬 여부 */
        private Boolean firstBloodKill;
        /** 첫 타워 어시스트 여부 */
        private Boolean firstTowerAssist;
        /** 첫 타워 킬 여부 */
        private Boolean firstTowerKill;
        /** 조기 항복으로 게임 종료 여부 */
        private Boolean gameEndedInEarlySurrender;
        /** 항복으로 게임 종료 여부 */
        private Boolean gameEndedInSurrender;
        /** 뒤로가 핑 횟수 */
        private Integer getBackPings;
        /** 획득한 골드 */
        private Integer goldEarned;
        /** 사용한 골드 */
        private Integer goldSpent;
        /** 대기 핑 횟수 */
        private Integer holdPings;
        /** 개별 포지션 (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY, NONE) */
        private String individualPosition;
        /** 억제기 킬 수 */
        private Integer inhibitorKills;
        /** 억제기 타케다운 횟수 */
        private Integer inhibitorTakedowns;
        /** 잃은 억제기 수 */
        private Integer inhibitorsLost;
        /** 아이템 슬롯 0 (0~5 = 장비, 6 = 장신구) */
        private Integer item0;
        /** 아이템 슬롯 1 */
        private Integer item1;
        /** 아이템 슬롯 2 */
        private Integer item2;
        /** 아이템 슬롯 3 */
        private Integer item3;
        /** 아이템 슬롯 4 */
        private Integer item4;
        /** 아이템 슬롯 5 */
        private Integer item5;
        /** 아이템 슬롯 6 (장신구) */
        private Integer item6;
        /** 구매한 아이템 수 */
        private Integer itemsPurchased;
        /** 킬링 스프리 횟수 */
        private Integer killingSprees;
        /** 킬 수 */
        private Integer kills;
        /** 라인 (TOP, JUNGLE, MIDDLE, BOTTOM, NONE) */
        private String lane;
        /** 최대 치명타 피해 */
        private Integer largestCriticalStrike;
        /** 최대 연속 킬 */
        private Integer largestKillingSpree;
        /** 최대 멀티킬 (2=더블, 3=트리플, 4=쿼드라, 5=펜타) */
        private Integer largestMultiKill;
        /** 최장 생존 시간 (초) */
        private Integer longestTimeSpentLiving;
        /** 마법 피해 (모든 대상에게) */
        private Integer magicDamageDealt;
        /** 챔피언에게 가한 마법 피해 */
        private Integer magicDamageDealtToChampions;
        /** 받은 마법 피해 */
        private Integer magicDamageTaken;
        /** 미션 점수 정보 */
        private Missions missions;
        /** 시야 필요 핑 횟수 */
        private Integer needVisionPings;
        /** 중립 미니언 킬 수 (정글 몬스터) */
        private Integer neutralMinionsKilled;
        /** 넥서스 킬 수 */
        private Integer nexusKills;
        /** 잃은 넥서스 수 */
        private Integer nexusLost;
        /** 넥서스 타케다운 횟수 */
        private Integer nexusTakedowns;
        /** 훔친 오브젝트 수 */
        private Integer objectivesStolen;
        /** 오브젝트 훔치기 어시스트 수 */
        private Integer objectivesStolenAssists;
        /** 가는 중 핑 횟수 */
        private Integer onMyWayPings;
        /** 참가자-tier (1~10) */
        private Integer participantId;
        /** 펜타킬 횟수 */
        private Integer pentaKills;
        /** 룬 및 특성 정보 */
        private Perks perks;
        /** 물리 피해 (모든 대상에게) */
        private Integer physicalDamageDealt;
        /** 챔피언에게 가한 물리 피해 */
        private Integer physicalDamageDealtToChampions;
        /** 받은 물리 피해 */
        private Integer physicalDamageTaken;
        /** 플레이스먼트 (특정 게임 모드용) */
        private Integer placement;
        /** 플레이어 보강 1 */
        private Integer playerAugment1;
        /** 플레이어 보강 2 */
        private Integer playerAugment2;
        /** 플레이어 보강 3 */
        private Integer playerAugment3;
        /** 플레이어 보강 4 */
        private Integer playerAugment4;
        /** 플레이어 보강 5 */
        private Integer playerAugment5;
        /** 플레이어 보강 6 */
        private Integer playerAugment6;
        /** 플레이어 서브팀 ID */
        private Integer playerSubteamId;
        /** 프로필 아이콘 ID */
        private Integer profileIcon;
        /** 밀어 핑 횟수 */
        private Integer pushPings;
        /** 플레이어 고유 ID (PUUID) */
        private String puuid;
        /** 쿼드라킬 횟수 */
        private Integer quadraKills;
        /** 후퇴 핑 횟수 */
        private Integer retreatPings;
        /** 라이엇 ID 게임 이름 */
        private String riotIdGameName;
        /** 라이엇 ID 태그라인 */
        private String riotIdTagline;
        /** 역할 (SOLO, NONE, CARRY, SUPPORT, DUO) */
        private String role;
        /** 게임 중 구매한 일반 와드 수 */
        private Integer sightWardsBoughtInGame;
        /** 스킬 1 사용 횟수 */
        private Integer spell1Casts;
        /** 스킬 2 사용 횟수 */
        private Integer spell2Casts;
        /** 스킬 3 사용 횟수 */
        private Integer spell3Casts;
        /** 스킬 4 (궁극기) 사용 횟수 */
        private Integer spell4Casts;
        /** 서브팀 플레이스먼트 */
        private Integer subteamPlacement;
        /** 소환사 주문 1 사용 횟수 */
        private Integer summoner1Casts;
        /** 소환사 주문 1 ID (D/F 키) */
        private Integer summoner1Id;
        /** 소환사 주문 2 사용 횟수 */
        private Integer summoner2Casts;
        /** 소환사 주문 2 ID */
        private Integer summoner2Id;
        /** 소환사 ID */
        private String summonerId;
        /** 소환사 레벨 */
        private Integer summonerLevel;
        /** 소환사 이름 (구버전, 보통 빈 문자열) */
        private String summonerName;
        /** 팀 조기 항복 여부 */
        private Boolean teamEarlySurrendered;
        /** 팀 ID (100=블루팀, 200=레드팀) */
        private Integer teamId;
        /** 팀 포지션 (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY, NONE) */
        private String teamPosition;
        /** 다른 챔피언을 CC한 시간 (초) */
        private Integer timeCCingOthers;
        /** 플레이한 시간 (초) */
        private Integer timePlayed;
        /** 아군 정글 미니언 킬 수 */
        private Integer totalAllyJungleMinionsKilled;
        /** 모든 대상에게 가한 총 피해 */
        private Integer totalDamageDealt;
        /** 챔피언에게 가한 총 피해 */
        private Integer totalDamageDealtToChampions;
        /** 팀원에게 보호막으로 막은 피해 */
        private Integer totalDamageShieldedOnTeammates;
        /** 받은 총 피해 */
        private Integer totalDamageTaken;
        /** 적 정글 미니언 킬 수 */
        private Integer totalEnemyJungleMinionsKilled;
        /** 총 회복량 */
        private Integer totalHeal;
        /** 팀원에게 한 총 회복량 */
        private Integer totalHealsOnTeammates;
        /** 킬한 총 미니언 수 */
        private Integer totalMinionsKilled;
        /** 가한 총 CC 시간 (초) */
        private Integer totalTimeCCDealt;
        /** 총 사망 시간 (초) */
        private Integer totalTimeSpentDead;
        /** 회복한 총 유닛 수 */
        private Integer totalUnitsHealed;
        /** 트리플킬 횟수 */
        private Integer tripleKills;
        /** 고정 피해 (모든 대상에게) */
        private Integer trueDamageDealt;
        /** 챔피언에게 가한 고정 피해 */
        private Integer trueDamageDealtToChampions;
        /** 받은 고정 피해 */
        private Integer trueDamageTaken;
        /** 포탑 킬 수 */
        private Integer turretKills;
        /** 포탑 타케다운 횟수 */
        private Integer turretTakedowns;
        /** 잃은 포탑 수 */
        private Integer turretsLost;
        /** 언리얼킬 횟수 */
        private Integer unrealKills;
        /** 시야 정리 핑 횟수 */
        private Integer visionClearedPings;
        /** 시야 점수 */
        private Integer visionScore;
        /** 게임 중 구매한 제어 와드 수 */
        private Integer visionWardsBoughtInGame;
        /** 파괴한 와드 수 */
        private Integer wardsKilled;
        /** 설치한 와드 수 */
        private Integer wardsPlaced;
        /** 승리 여부 */
        private Boolean win;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Challenges {
        /** 스킬 사용 횟수 */
        private Integer abilityUses;
        /** 15분 이내 에이스 횟수 */
        private Integer acesBefore15Minutes;
        /** 아군 정글 몬스터 킬 수 */
        private Integer alliedJungleMonsterKills;
        /** 바론 타케다운 횟수 */
        private Integer baronTakedowns;
        /** 상대방 반대편 폭발 콘 사용 횟수 */
        private Integer blastConeOppositeOpponentCount;
        /** 현상금 골드 */
        private Integer bountyGold;
        /** 훔친 버프 수 */
        private Integer buffsStolen;
        /** 시간 내 서포터 퀘스트 완료 여부 */
        private Integer completeSupportQuestInTime;
        /** 강/상대 진영 제어 와드 시야 커버리지 */
        private Double controlWardTimeCoverageInRiverOrEnemyHalf;
        /** 설치한 제어 와드 수 */
        private Integer controlWardsPlaced;
        /** 분당 데미지 */
        private Double damagePerMinute;
        /** 팀 대비 받은 피해 חן력 */
        private Double damageTakenOnTeamPercentage;
        /** 전령 춤춘 횟수 */
        private Integer dancedWithRiftHerald;
        /** 적 챔피언에게 죽은 횟수 */
        private Integer deathsByEnemyChamps;
        /** 좁은 시간 창에서 스킬 회피 횟수 */
        private Integer dodgeSkillShotsSmallWindow;
        /** 더블 에이스 횟수 */
        private Integer doubleAces;
        /** 드래곤 타케다운 횟수 */
        private Integer dragonTakedowns;
        /** 가장 빠른 드래곤 타케다운 시간 (분) */
        private Double earliestDragonTakedown;
        /** 초반 라인전 골드/경험치 우위 */
        private Integer earlyLaningPhaseGoldExpAdvantage;
        /** 효과적인 회복 및 보호막량 */
        private Integer effectiveHealAndShielding;
        /** 상대 영혼 보유 중 고대용 킬 수 */
        private Integer elderDragonKillsWithOpposingSoul;
        /** 고대용 멀티킬 횟수 */
        private Integer elderDragonMultikills;
        /** 적 챔피언 기절 횟수 */
        private Integer enemyChampionImmobilizations;
        /** 적 정글 몬스터 킬 수 */
        private Integer enemyJungleMonsterKills;
        /** 적 정글러 근처 에픽 몬스터 킬 수 */
        private Integer epicMonsterKillsNearEnemyJungler;
        /** 스폰 후 30초 내 에픽 몬스터 킬 수 */
        private Integer epicMonsterKillsWithin30SecondsOfSpawn;
        /** 에픽 몬스터 도난 횟수 */
        private Integer epicMonsterSteals;
        /** 스마이트 없이 에픽 몬스터 도난 횟수 */
        private Integer epicMonsterStolenWithoutSmite;
        /** 빠른 서포터 퀘스트 완료 여부 */
        private Integer fasterSupportQuestCompletion;
        /** 첫 타워 킬 횟수 */
        private Integer firstTurretKilled;
        /** 첫 타워 킬 시간 (분) */
        private Double firstTurretKilledTime;
        /** 주먹 인사 참여 횟수 */
        private Integer fistBumpParticipation;
        /** 완벽한 에이스 횟수 (무사실 에이스) */
        private Integer flawlessAces;
        /** 풀팀 타케다운 횟수 */
        private Integer fullTeamTakedown;
        /** 게임 길이 (분) */
        private Double gameLength;
        /** 라이너로서 초반 정글에서 모든 라인 타케다운 횟수 */
        private Integer getTakedownsInAllLanesEarlyJungleAsLaner;
        /** 분당 골드 */
        private Double goldPerMinute;
        /** 열린 넥서스 보유 여부 */
        private Integer hadOpenNexus;
        /** 맵 소스에서 회복량 */
        private Integer healFromMapSources;
        /** 가장 높은 챔피언 피해 */
        private Integer highestChampionDamage;
        /** 가장 높은 군중 제어 점수 */
        private Integer highestCrowdControlScore;
        /** 가장 높은 와드 킬 수 */
        private Integer highestWardKills;
        /** 아군과 함께 기절 후 킬 횟수 */
        private Integer immobilizeAndKillWithAlly;
        /** 지옥 비늘 획득 횟수 */
        private Integer infernalScalePickup;
        /** 초기 버프 수 */
        private Integer initialBuffCount;
        /** 초기 게 크랩 킬 수 */
        private Integer initialCrabCount;
        /** 10분 이내 정글 CS */
        private Integer jungleCsBefore10Minutes;
        /** 정글러로서 초반 정글에서 킬 횟수 */
        private Integer junglerKillsEarlyJungle;
        /** 피해를 입은 에픽 몬스터 근처에서 정글러 타케다운 횟수 */
        private Integer junglerTakedownsNearDamagedEpicMonster;
        /** 타워 판 금지 전에 파괴한 외곽 타워 수 */
        private Integer kTurretsDestroyedBeforePlatesFall;
        /** KDA (Kill Death Assist) */
        private Double kda;
        /** 아군과 함께 숨은 후 킬 횟수 */
        private Integer killAfterHiddenWithAlly;
        /** 킬 참여율 */
        private Double killParticipation;
        /** 풀 팀 피해를 받았지만 살아남은 챔피언 킬 횟수 */
        private Integer killedChampTookFullTeamDamageSurvived;
        /** 킬링 스프리 횟수 */
        private Integer killingSprees;
        /** 적 타워 근처에서 킬 횟수 */
        private Integer killsNearEnemyTurret;
        /** 정글러로서 초반 정글에서 라이너 킬 횟수 */
        private Integer killsOnLanersEarlyJungleAsJungler;
        /** 라이너로서 초반 정글에서 다른 라인 킬 횟수 */
        private Integer killsOnOtherLanesEarlyJungleAsLaner;
        /** ARAM 팩으로 최근 회복된 대상 킬 횟수 */
        private Integer killsOnRecentlyHealedByAramPack;
        /** 자신의 타워 아래에서 킬 횟수 */
        private Integer killsUnderOwnTurret;
        /** 에픽 몬스터 도움으로 킬 횟수 */
        private Integer killsWithHelpFromEpicMonster;
        /** 적을 팀 안으로 넣고 킬 횟수 */
        private Integer knockEnemyIntoTeamAndKill;
        /** 초반 스킬샷 명중 횟수 */
        private Integer landSkillShotsEarlyGame;
        /** 처음 10분 라인 미니언 수 */
        private Integer laneMinionsFirst10Minutes;
        /** 라인전 골드/경험치 우위 */
        private Integer laningPhaseGoldExpAdvantage;
        /** 전설 아이템 보유 수 */
        private Integer legendaryCount;
        /** 사용한 전설 아이템 목록 */
        private List<Integer> legendaryItemUsed;
        /** 잃은 억제기 수 */
        private Integer lostAnInhibitor;
        /** 라인 상대 대비 최대 CS 우위 */
        private Integer maxCsAdvantageOnLaneOpponent;
        /** 최대 킬 차이 (뒤처진 상태) */
        private Integer maxKillDeficit;
        /** 라인 상대 대비 최대 레벨 리드 */
        private Integer maxLevelLeadLaneOpponent;
        /** 시간 내 멕아이 풀스택 횟수 */
        private Integer mejaisFullStackInTime;
        /** 상대 대비 더 많은 적 정글 몬스터 킬 */
        private Double moreEnemyJungleThanOpponent;
        /** 한 스킬로 멀티킬 횟수 */
        private Integer multiKillOneSpell;
        /** 전령으로 여러 타워 파괴 횟수 */
        private Integer multiTurretRiftHeraldCount;
        /** 멀티킬 횟수 */
        private Integer multikills;
        /** 공격적인 플래시 후 멀티킬 횟수 */
        private Integer multikillsAfterAggressiveFlash;
        /** 10분 이내 외곽 타워 처치 횟수 */
        private Integer outerTurretExecutesBefore10Minutes;
        /** 숫적 열세 상황에서 킬 횟수 */
        private Integer outnumberedKills;
        /** 숫적 열세 상황에서 넥서스 킬 횟수 */
        private Integer outnumberedNexusKill;
        /** 완벽한 드래곤 영혼 획득 횟수 */
        private Integer perfectDragonSoulsTaken;
        /** 완벽한 게임 여부 */
        private Integer perfectGame;
        /** 아군과 함께 픽 킬 횟수 */
        private Integer pickKillWithAlly;
        /** 선택한 포지션과 일치 여부 */
        private Integer playedChampSelectPosition;
        /** 포로 폭발 횟수 (ARAM) */
        private Integer poroExplosions;
        /** 빠른 정화 사용 횟수 */
        private Integer quickCleanse;
        /** 빠른 첫 타워 킬 여부 */
        private Integer quickFirstTurret;
        /** 빠른 솔로 킬 횟수 */
        private Integer quickSoloKills;
        /** 전령 타케다운 횟수 */
        private Integer riftHeraldTakedowns;
        /** 아군을 죽음에서 구한 횟수 */
        private Integer saveAllyFromDeath;
        /** 게 크랩 킬 수 */
        private Integer scuttleCrabKills;
        /** 회피한 스킬샷 수 */
        private Integer skillshotsDodged;
        /** 명중한 스킬샷 수 */
        private Integer skillshotsHit;
        /** 명중한 눈덩이 수 (ARAM) */
        private Integer snowballsHit;
        /** 솔로 바론 킬 수 */
        private Integer soloBaronKills;
        /** 솔로 킬 수 */
        private Integer soloKills;
        /** 후반 솔로 타워 파괴 수 */
        private Integer soloTurretsLategame;
        /** 설치한 투명 와드 수 */
        private Integer stealthWardsPlaced;
        /** 한 자릿수 HP로 살아남은 횟수 */
        private Integer survivedSingleDigitHpCount;
        /** 전투에서 3번 기절당했지만 살아남은 횟수 */
        private Integer survivedThreeImmobilizesInFight;
        /** 첫 타워에서 타케다운 횟수 */
        private Integer takedownOnFirstTurret;
        /** 타케다운 횟수 (킬+어시스트) */
        private Integer takedowns;
        /** 레벨 우위 획득 후 타케다운 횟수 */
        private Integer takedownsAfterGainingLevelAdvantage;
        /** 정글 미니언 스폰 전 타케다운 횟수 */
        private Integer takedownsBeforeJungleMinionSpawn;
        /** 처음 X분 타케다운 횟수 */
        private Integer takedownsFirstXMinutes;
        /** 구석에서 타케다운 횟수 */
        private Integer takedownsInAlcove;
        /** 적 분수에서 타케다운 횟수 */
        private Integer takedownsInEnemyFountain;
        /** 팀 바론 킬 수 */
        private Integer teamBaronKills;
        /** 팀 대비 데미지 비율 */
        private Double teamDamagePercentage;
        /** 팀 고대용 킬 수 */
        private Integer teamElderDragonKills;
        /** 팀 전령 킬 수 */
        private Integer teamRiftHeraldKills;
        /** 텔레포트 타케다운 횟수 */
        private Integer teleportTakedowns;
        /** 큰 피해를 받았지만 살아남은 횟수 */
        private Integer tookLargeDamageSurvived;
        /** 타워 판 획득 수 */
        private Integer turretPlatesTaken;
        /** 타워 타케다운 횟수 */
        private Integer turretTakedowns;
        /** 전령으로 타워 파괴 수 */
        private Integer turretsTakenWithRiftHerald;
        /** 3초 내 20미니언 킬 횟수 */
        private Integer twentyMinionsIn3SecondsCount;
        /** 2와드+1스위퍼 보유 횟수 */
        private Integer twoWardsOneSweeperCount;
        /** 보이지 않는 리캐일 횟수 */
        private Integer unseenRecalls;
        /** 라인 상대 대비 시야 점수 우위 */
        private Double visionScoreAdvantageLaneOpponent;
        /** 분당 시야 점수 */
        private Double visionScorePerMinute;
        /** 공허 몬스터 킬 수 */
        private Integer voidMonsterKill;
        /** 와드 타케다운 횟수 */
        private Integer wardTakedowns;
        /** 20분 이내 와드 타케다운 횟수 */
        private Integer wardTakedownsBefore20M;
        /** 지켜낸 와드 수 */
        private Integer wardsGuarded;
        /** 스웜 모드: 아트록스 처치 횟수 */
        private Integer swarmDefeatAatrox;
        /** 스웜 모드: 브리아르 처치 횟수 */
        private Integer swarmDefeatBriar;
        /** 스웜 모드: 미니 보스 처치 횟수 */
        private Integer swarmDefeatMiniBosses;
        /** 스웜 모드: 무기 진화 횟수 */
        private Integer swarmEvolveWeapon;
        /** 스웜 모드: 패시브 3개 보유 횟수 */
        private Integer swarmHave3Passives;
        /** 스웜 모드: 적 처치 횟수 */
        private Integer swarmKillEnemy;
        /** 스웜 모드: 골드 획득 횟수 */
        private Integer swarmPickupGold;
        /** 스웜 모드: 레벨 50 도달 횟수 */
        private Integer swarmReachLevel50;
        /** 스웜 모드: 15분 생존 횟수 */
        private Integer swarmSurvive15Min;
        /** 스웜 모드: 5개 진화 무기로 승리 횟수 */
        private Integer swarmWinWith5EvolvedWeapons;
        /** 12연속 어시스트 횟수 */
        private Integer twelveAssistStreakCount;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Missions {
        /** 플레이어 점수 0 */
        private Integer playerScore0;
        /** 플레이어 점수 1 */
        private Integer playerScore1;
        /** 플레이어 점수 2 */
        private Integer playerScore2;
        /** 플레이어 점수 3 */
        private Integer playerScore3;
        /** 플레이어 점수 4 */
        private Integer playerScore4;
        /** 플레이어 점수 5 */
        private Integer playerScore5;
        /** 플레이어 점수 6 */
        private Integer playerScore6;
        /** 플레이어 점수 7 */
        private Integer playerScore7;
        /** 플레이어 점수 8 */
        private Integer playerScore8;
        /** 플레이어 점수 9 */
        private Integer playerScore9;
        /** 플레이어 점수 10 */
        private Integer playerScore10;
        /** 플레이어 점수 11 */
        private Integer playerScore11;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Perks {
        /** 스탯 룬 정보 */
        private StatPerks statPerks;
        /** 룬 스타일 목록 */
        private List<Style> styles;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatPerks {
        /** 방어 룬 ID */
        private Integer defense;
        /** 유연 룬 ID */
        private Integer flex;
        /** 공격 룬 ID */
        private Integer offense;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Style {
        /** 룬 스타일 설명 */
        private String description;
        /** 선택한 룬 목록 */
        private List<Selection> selections;
        /** 룬 스타일 ID */
        private Integer style;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Selection {
        /** 룬 ID */
        private Integer perk;
        /** 룬 변수 1 */
        private Integer var1;
        /** 룬 변수 2 */
        private Integer var2;
        /** 룬 변수 3 */
        private Integer var3;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Team {
        /** 밴 목록 */
        private List<Ban> bans;
        /** 업적 정보 */
        private Feats feats;
        /** 오브젝트 정보 */
        private Objectives objectives;
        /** 팀 ID (100=블루팀, 200=레드팀) */
        private Integer teamId;
        /** 승리 여부 */
        private Boolean win;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Ban {
        /** 밴한 챔피언 ID */
        private Integer championId;
        /** 밴 턴 */
        private Integer pickTurn;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Feats {
        /** 에픽 몬스터 킬 업적 상태 */
        private FeatState EPIC_MONSTER_KILL;
        /** 퍼스트블러드 업적 상태 */
        private FeatState FIRST_BLOOD;
        /** 첫 타워 업적 상태 */
        private FeatState FIRST_TURRET;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FeatState {
        /** 업적 상태 값 */
        private Integer featState;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Objectives {
        /** 아타칸 오브젝트 통계 */
        private ObjectiveStat atakhan;
        /** 바론 오브젝트 통계 */
        private ObjectiveStat baron;
        /** 챔피언 오브젝트 통계 */
        private ObjectiveStat champion;
        /** 드래곤 오브젝트 통계 */
        private ObjectiveStat dragon;
        /** 호드 오브젝트 통계 */
        private ObjectiveStat horde;
        /** 억제기 오브젝트 통계 */
        private ObjectiveStat inhibitor;
        /** 전령 오브젝트 통계 */
        private ObjectiveStat riftHerald;
        /** 타워 오브젝트 통계 */
        private ObjectiveStat tower;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ObjectiveStat {
        /** 첫 획득 여부 */
        private Boolean first;
        /** 킬 수 */
        private Integer kills;
    }
}
