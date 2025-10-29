// src/main/java/lol/jen/lol/service/MatchService.java
package hyun.lol.service;

import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchDto;
import hyun.lol.dto.MatchSummaryDto;
import hyun.lol.dto.ParticipantDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.core.ParameterizedTypeReference;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    @Qualifier("riotRegionalClient")
    private final WebClient riotRegionalClient;

    private final SummonerService summonerService; // puuid 조회 재사용

    // ==========================================
    // 1. puuid → matchId 배열 조회
    // ==========================================
    
    /** puuid로 matchId 배열 조회 */
    private Mono<List<String>> getMatchIdsByPuuid(String puuid, int count) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                        .queryParam("start", 0)
                        .queryParam("count", Math.max(1, Math.min(count, 20)))
                        .build(puuid))
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> toApiError("match-ids-by-puuid", r))
                .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                .defaultIfEmpty(List.of());
    }

    // ==========================================
    // 2. matchId 배열 → MatchDto 배열 조회
    // ==========================================
    
    /** matchId 배열로 MatchDto 배열 조회 */
    private Mono<List<MatchDto>> getMatchDtosByMatchIds(List<String> matchIds) {
        if (matchIds == null || matchIds.isEmpty()) {
            return Mono.just(List.of());
        }
        return reactor.core.publisher.Flux.fromIterable(matchIds)
                .concatMap(this::getMatchDtoByMatchId)                       // 각 matchId를 MatchDto로 조회
                .collectList();
    }

    // ==========================================
    // 3. MatchDto 배열 → MatchSummaryDto 배열 변환
    // ==========================================
    
    /** MatchDto 배열로 MatchSummaryDto 배열 변환 */
    private Mono<List<MatchSummaryDto>> getMatchSummaryDtosByMatchDtos(List<MatchDto> matchDtos) {
        if (matchDtos == null || matchDtos.isEmpty()) {
            return Mono.just(List.of());
        }
        return reactor.core.publisher.Flux.fromIterable(matchDtos)
                .map(this::convertMatchDtoToSummaryDto)                       // 각 MatchDto를 MatchSummaryDto로 변환
                .collectList();
    }

    // ==========================================
    // 4. PUBLIC API - 게임명+태그로 MatchSummaryDto 리스트 조회 (위 3개 메서드 사용)
    // ==========================================
    
    /** 게임명+태그로 최근 N개의 MatchSummaryDto 조회 (컨트롤러에서 사용) */
    public Mono<List<MatchSummaryDto>> getMatchSummaryDtosByMatchIds(String gameName, String tagLine, int count) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine)  // PUUID 조회 (SummonerService)
                .flatMap(acc -> getMatchIdsByPuuid(acc.getPuuid(), count))           // 1. puuid로 matchId 배열 조회
                .flatMap(this::getMatchDtosByMatchIds)                               // 2. matchId 배열로 MatchDto 배열 조회
                .flatMap(this::getMatchSummaryDtosByMatchDtos);                      // 3. MatchDto 배열로 MatchSummaryDto 배열 변환
    }

    // ==========================================
    // 5. PUBLIC API - matchId로 MatchDetailDto 조회 (상세보기)
    // ==========================================
    
    /** matchId로 MatchDetailDto 조회 (상세보기 버튼 클릭 시 사용) */
    public Mono<MatchDetailDto> getMatchDetailByMatchId(String matchId) {
        return getMatchDtoByMatchId(matchId)
                .map(this::convertMatchDtoToDetailDto)
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("Match not found: {}", matchId);
                    return Mono.empty();
                }))
                .onErrorResume(e -> {
                    log.error("Match detail failed for {}: {}", matchId, e.getMessage());
                    return Mono.just(emptyMatchDetail());
                });
    }

    // ==========================================
    // 6. MatchDto → MatchDetailDto 변환 (상세보기용)
    // ==========================================
    
    /** matchId로 MatchDto 조회 (Riot API 원시 응답 - 내부 헬퍼 메서드) */
    private Mono<MatchDto> getMatchDtoByMatchId(String matchId) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/lol/match/v5/matches/{matchId}").build(matchId))
                .exchangeToMono(resp -> {
                    if (resp.statusCode().is2xxSuccessful()) {
                        return resp.bodyToMono(MatchDto.class);
                    }
                    if (resp.statusCode().value() == 404) {
                        return Mono.empty();
                    }
                    return toApiError("match-by-id", resp).flatMap(Mono::error);
                });
    }

    /** MatchDto → MatchSummaryDto 변환 (전적 목록 카드용 - 내부 헬퍼 메서드) */
    private MatchSummaryDto convertMatchDtoToSummaryDto(MatchDto raw) {
        MatchSummaryDto dto = new MatchSummaryDto();
        
        // Metadata 설정
        MatchSummaryDto.Metadata metadata = new MatchSummaryDto.Metadata();
        if (raw.getMetadata() != null && raw.getMetadata().getMatchId() != null) {
            metadata.setMatchId(raw.getMetadata().getMatchId());
        }
        dto.setMetadata(metadata);
        
        // Info 설정
        MatchSummaryDto.Info info = new MatchSummaryDto.Info();
        if (raw.getInfo() != null) {
            var rawInfo = raw.getInfo();
            info.setGameCreation(rawInfo.getGameCreation() != null ? rawInfo.getGameCreation() : 0L);
            info.setGameDuration(rawInfo.getGameDuration() != null ? rawInfo.getGameDuration() : 0L);
            info.setGameMode(rawInfo.getGameMode());
            info.setQueueId(rawInfo.getQueueId());

            var parts = rawInfo.getParticipants() == null ? List.<MatchDto.Participant>of() : rawInfo.getParticipants();
            info.setParticipants(parts.stream().map(p -> {
                ParticipantDto x = new ParticipantDto();
                x.setPuuid(p.getPuuid());
                x.setRiotIdGameName(p.getRiotIdGameName());
                x.setSummonerName(resolveSummonerName(p));
                x.setChampionName(p.getChampionName());
                x.setTeamId(nz(p.getTeamId()));
                x.setKills(nz(p.getKills()));
                x.setDeaths(nz(p.getDeaths()));
                x.setAssists(nz(p.getAssists()));
                x.setChampLevel(nz(p.getChampLevel()));
                x.setWin(Boolean.TRUE.equals(p.getWin()));

                // CS 합산
                int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());
                x.setCsTotal(cs);

                // 주문/룬/아이템
                x.setSummoner1Id(p.getSummoner1Id());
                x.setSummoner2Id(p.getSummoner2Id());
                x.setPrimaryStyleId(safePrimaryStyle(p));
                x.setSubStyleId(safeSubStyle(p));
                x.setKeystoneId(safeKeystone(p));
                x.setPerkIds(allPerkIds(p));
                x.setTotalDamageDealtToChampions(nz(p.getTotalDamageDealtToChampions()));
                x.setTotalDamageTaken(nz(p.getTotalDamageTaken()));
                x.setItem0(p.getItem0()); x.setItem1(p.getItem1()); x.setItem2(p.getItem2());
                x.setItem3(p.getItem3()); x.setItem4(p.getItem4()); x.setItem5(p.getItem5()); x.setItem6(p.getItem6());
                return x;
            }).toList());
        }
        dto.setInfo(info);
        return dto;
    }

    /** MatchDto → MatchDetailDto 변환 (매치 상세 정보) */
    private MatchDetailDto convertMatchDtoToDetailDto(MatchDto raw) {
        try {
            if (raw == null || raw.getInfo() == null) {
                return emptyMatchDetail();
            }

            var rawInfo = raw.getInfo();
            var rawMetadata = raw.getMetadata();

            String matchId = rawMetadata != null ? rawMetadata.getMatchId() : null;
            long gameCreation = rawInfo.getGameCreation() != null ? rawInfo.getGameCreation() : 0L;
            long gameDuration = rawInfo.getGameDuration() != null ? rawInfo.getGameDuration() : 0L;
            Integer queueId = rawInfo.getQueueId();
            String gameMode = rawInfo.getGameMode();

            // MatchDto.Team을 사용하여 팀 정보 추출
            Map<Integer, MatchDetailDto.TeamDto> teamsMap = convertMatchDtoTeamsToTeamDtos(rawInfo.getTeams());

            // 참가자 정보 추출 (팀 킬 계산 + 참가자 매핑을 한 번의 순회로 통합)
            Map<Integer, Integer> teamKills = new HashMap<>();
            List<ParticipantDto> participants = new ArrayList<>();
            var parts = rawInfo.getParticipants();
            if (parts != null) {
                for (MatchDto.Participant p : parts) {
                    if (p == null) continue;
                    
                    // 팀별 킬 수 계산
                    if (p.getTeamId() != null) {
                        teamKills.merge(p.getTeamId(), nz(p.getKills()), Integer::sum);
                    }
                    
                    // 참가자 매핑
                    try {
                        participants.add(convertMatchDtoParticipantToParticipantDto(p, teamKills, gameDuration));
                    } catch (Exception ex) {
                        log.warn("Participant parse failed: {}", ex.getMessage());
                    }
                }
            }

            // MatchSummaryDto 생성
            MatchSummaryDto matchDto = new MatchSummaryDto();
            MatchSummaryDto.Metadata metadata = new MatchSummaryDto.Metadata();
            metadata.setMatchId(matchId);
            matchDto.setMetadata(metadata);
            
            MatchSummaryDto.Info info = new MatchSummaryDto.Info();
            info.setGameCreation(gameCreation);
            info.setGameDuration(gameDuration);
            info.setQueueId(queueId);
            info.setGameMode(gameMode);
            info.setParticipants(participants);
            matchDto.setInfo(info);

            return MatchDetailDto.builder()
                    .match(matchDto)
                    .teams(teamsMap.values().stream()
                            .sorted(Comparator.comparing(MatchDetailDto.TeamDto::getTeamId))
                            .toList())
                    .build();

        } catch (Exception e) {
            log.error("Match detail mapping failed: {}", e.getMessage(), e);
            return emptyMatchDetail();
        }
    }

    // ==========================================
    // 8. DetailDto 변환을 위한 헬퍼 메서드
    // ==========================================
    
    /** MatchDto.Participant → ParticipantDto 변환 */
    private ParticipantDto convertMatchDtoParticipantToParticipantDto(MatchDto.Participant p, Map<Integer, Integer> teamKills, long gameDurationSec) {
        int teamId = nz(p.getTeamId());
        int kills = nz(p.getKills());
        int deaths = nz(p.getDeaths());
        int assists = nz(p.getAssists());
        int totalDmgToChamps = nz(p.getTotalDamageDealtToChampions());
        int totalDmgTaken = nz(p.getTotalDamageTaken());
        int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());

        // 룬 정보 추출
        MatchDto.Perks perks = p.getPerks();
        Integer primaryStyle = null, subStyle = null;
        Integer keystoneId = null;
        List<Integer> perkIds = new ArrayList<>();
        
        if (perks != null && perks.getStyles() != null) {
            for (MatchDto.Style style : perks.getStyles()) {
                if (style != null && style.getStyle() != null) {
                    int styleId = style.getStyle();
                    if (primaryStyle == null) {
                        primaryStyle = styleId;
                    } else if (subStyle == null) {
                        subStyle = styleId;
                    }
                }
                if (style != null && style.getSelections() != null) {
                    for (MatchDto.Selection sel : style.getSelections()) {
                        if (sel != null && sel.getPerk() != null) {
                            Integer perkId = sel.getPerk();
                            perkIds.add(perkId);
                            if (primaryStyle != null && keystoneId == null && sel.getVar1() != null && sel.getVar1() != 0) {
                                keystoneId = perkId;
                            }
                        }
                    }
                }
            }
        }
        
        // 첫 번째 perkId를 keystone으로 사용
        if (keystoneId == null && !perkIds.isEmpty()) {
            keystoneId = perkIds.get(0);
        }

        ParticipantDto dto = new ParticipantDto();
        dto.setTeamId(teamId);
        dto.setPuuid(p.getPuuid());
        dto.setRiotIdGameName(p.getRiotIdGameName());
        dto.setSummonerName(resolveSummonerName(p));
        dto.setChampionName(p.getChampionName());
        dto.setKills(kills);
        dto.setDeaths(deaths);
        dto.setAssists(assists);
        dto.setWin(Boolean.TRUE.equals(p.getWin()));
        dto.setChampLevel(nz(p.getChampLevel()));
        dto.setSummoner1Id(p.getSummoner1Id());
        dto.setSummoner2Id(p.getSummoner2Id());
        dto.setPrimaryStyleId(primaryStyle);
        dto.setSubStyleId(subStyle);
        dto.setKeystoneId(keystoneId);
        dto.setPerkIds(perkIds);
        dto.setItem0(p.getItem0());
        dto.setItem1(p.getItem1());
        dto.setItem2(p.getItem2());
        dto.setItem3(p.getItem3());
        dto.setItem4(p.getItem4());
        dto.setItem5(p.getItem5());
        dto.setItem6(p.getItem6());
        dto.setCsTotal(cs);
        dto.setTotalDamageDealtToChampions(totalDmgToChamps);
        dto.setTotalDamageTaken(totalDmgTaken);
        return dto;
    }

    /** MatchDto.Team 리스트 → MatchDetailDto.TeamDto 변환 */
    private Map<Integer, MatchDetailDto.TeamDto> convertMatchDtoTeamsToTeamDtos(List<MatchDto.Team> teams) {
        Map<Integer, MatchDetailDto.TeamDto> map = new HashMap<>();
        if (teams == null) return map;
        
        for (MatchDto.Team t : teams) {
            if (t == null || t.getTeamId() == null) continue;
            
            Integer teamId = t.getTeamId();
            Boolean win = t.getWin();
            
            MatchDto.Objectives obj = t.getObjectives();
            
            MatchDetailDto.TeamObjectives objectives = MatchDetailDto.TeamObjectives.builder()
                    .baron(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getBaron() : null))
                    .dragon(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getDragon() : null))
                    .tower(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getTower() : null))
                    .inhibitor(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getInhibitor() : null))
                    .riftHerald(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getRiftHerald() : null))
                    .champion(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getChampion() : null))
                    .build();

            Integer champKills = (obj != null && obj.getChampion() != null) ? nz(obj.getChampion().getKills()) : 0;

            map.put(teamId, MatchDetailDto.TeamDto.builder()
                    .teamId(teamId)
                    .win(win)
                    .objectives(objectives)
                    .championKills(champKills)
                    .build());
        }
        return map;
    }

    /** MatchDto.ObjectiveStat → MatchDetailDto.ObjectiveStat 변환 헬퍼 */
    private MatchDetailDto.ObjectiveStat convertMatchDtoObjectiveStatToObjectiveStat(MatchDto.ObjectiveStat rawStat) {
        if (rawStat == null) {
            return MatchDetailDto.ObjectiveStat.builder()
                    .kills(0)
                    .build();
        }
        return MatchDetailDto.ObjectiveStat.builder()
                .kills(nz(rawStat.getKills()))
                .build();
    }

    // ==========================================
    // 9. 유틸리티 메서드
    // ==========================================
    
    /** 공통 에러 변환 */
    private static Mono<? extends Throwable> toApiError(String api, ClientResponse resp) {
        int code = resp.statusCode().value();
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> Mono.error(new RuntimeException("[RiotAPI:" + api + "] HTTP " + code + " body=" + body)));
    }

    /** 빈 MatchDetailDto 생성 */
    private MatchDetailDto emptyMatchDetail() {
        MatchSummaryDto emptyMatch = new MatchSummaryDto();
        MatchSummaryDto.Metadata metadata = new MatchSummaryDto.Metadata();
        metadata.setMatchId(null);
        emptyMatch.setMetadata(metadata);
        
        MatchSummaryDto.Info info = new MatchSummaryDto.Info();
        info.setGameCreation(0L);
        info.setGameDuration(0L);
        info.setGameMode(null);
        info.setQueueId(null);
        info.setParticipants(List.of());
        emptyMatch.setInfo(info);
        
        return MatchDetailDto.builder()
                .match(emptyMatch)
                .teams(List.of())
                .build();
    }

    /** null을 0으로 변환 */
    private static int nz(Integer v){ return v==null?0:v; }
    
    /** summonerName 설정 헬퍼 (riotIdGameName 우선, 없으면 summonerName 사용) */
    private static String resolveSummonerName(MatchDto.Participant p) {
        return p.getRiotIdGameName() != null ? p.getRiotIdGameName() : p.getSummonerName();
    }

    /** 룬 정보 안전 추출 - Primary Style */
    private static Integer safePrimaryStyle(MatchDto.Participant p) {
        try {
            return p.getPerks().getStyles().get(0).getStyle();
        } catch (Exception e) {
            return null;
        }
    }

    /** 룬 정보 안전 추출 - Sub Style */
    private static Integer safeSubStyle(MatchDto.Participant p) {
        try { 
            return p.getPerks().getStyles().get(1).getStyle(); 
        } catch (Exception e) { 
            return null; 
        }
    }

    /** 룬 정보 안전 추출 - Keystone */
    private static Integer safeKeystone(MatchDto.Participant p) {
        try { 
            return p.getPerks().getStyles().get(0).getSelections().get(0).getPerk(); 
        } catch (Exception e) { 
            return null; 
        }
    }

    /** 룬 정보 안전 추출 - 모든 Perk IDs */
    private static List<Integer> allPerkIds(MatchDto.Participant p) {
        try {
            return p.getPerks().getStyles().stream()
                    .filter(Objects::nonNull)
                    .flatMap(s -> s.getSelections().stream())
                    .map(sel -> sel.getPerk())
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }
}
