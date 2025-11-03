// src/main/java/lol/jen/lol/service/MatchService.java
package hyun.lol.service;

import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchDto;
import hyun.lol.dto.MatchSummaryDto;
import hyun.lol.dto.ParticipantDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.server.ResponseStatusException;
import reactor.util.retry.Retry;

import java.util.*;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    @Qualifier("riotRegionalClient")
    private final WebClient riotRegionalClient;

    @Lazy
    private final SummonerService summonerService; // puuid 조회 재사용
    
    // MatchDto 캐시 (matchId -> Mono<MatchDto>)
    private final Map<String, Mono<MatchDto>> matchCache = new ConcurrentHashMap<>();

    // ==========================================
    // 1. puuid → matchId 배열 조회
    // ==========================================
    
    /** puuid로 matchId 배열 조회 (Riot API는 한 번에 최대 20개만 반환하므로, 더 많이 필요하면 여러 번 호출) */
    private Mono<List<String>> getMatchIdsByPuuid(String puuid, int count) {
        if (count <= 0) {
            return Mono.just(List.of());
        }
        
        // Riot API는 한 번에 최대 20개까지만 반환 가능
        final int MAX_PER_REQUEST = 20;
        final int requestsNeeded = (count + MAX_PER_REQUEST - 1) / MAX_PER_REQUEST; // 올림 연산
        
        if (requestsNeeded == 1) {
            // 20개 이하면 한 번만 호출
            return riotRegionalClient.get()
                    .uri(uri -> uri.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                            .queryParam("start", 0)
                            .queryParam("count", Math.min(count, MAX_PER_REQUEST))
                            .build(puuid))
                    .retrieve()
                    .onStatus(s -> s.value() == 429, r -> {
                        log.warn("Rate limit exceeded for puuid: {}", puuid);
                        return Mono.error(new ResponseStatusException(
                                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                                "API 요청 한도 초과. 잠시 후 다시 시도해주세요."));
                    })
                    .onStatus(HttpStatusCode::isError, r -> toApiError("match-ids-by-puuid", r))
                    .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                    .defaultIfEmpty(List.of())
                    .map(list -> list.stream().limit(count).toList()); // 요청한 개수만큼만 반환
        } else {
            // 20개 초과면 여러 번 호출하여 병합
            List<Mono<List<String>>> requestMonos = new ArrayList<>();
            for (int i = 0; i < requestsNeeded; i++) {
                final int start = i * MAX_PER_REQUEST;
                final int requestCount = Math.min(MAX_PER_REQUEST, count - start);
                if (requestCount <= 0) break;
                
                Mono<List<String>> requestMono = riotRegionalClient.get()
                        .uri(uri -> uri.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                                .queryParam("start", start)
                                .queryParam("count", requestCount)
                                .build(puuid))
                        .retrieve()
                        .onStatus(s -> s.value() == 429, r -> {
                            log.warn("Rate limit exceeded for puuid: {}", puuid);
                            return Mono.error(new ResponseStatusException(
                                    org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                                    "API 요청 한도 초과. 잠시 후 다시 시도해주세요."));
                        })
                        .onStatus(HttpStatusCode::isError, r -> toApiError("match-ids-by-puuid", r))
                        .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                        .defaultIfEmpty(List.of())
                        .delayElement(Duration.ofMillis(100 * i)); // 각 요청 사이 딜레이 (rate limit 방지)
                
                requestMonos.add(requestMono);
            }
            
            // 모든 요청을 순차적으로 실행하여 결과 병합
            return Flux.fromIterable(requestMonos)
                    .flatMapSequential(mono -> mono, 1) // 순차 실행 (동시 실행 시 rate limit 위험)
                    .collectList()
                    .map(lists -> lists.stream()
                            .flatMap(List::stream)
                            .limit(count) // 요청한 개수만큼만 반환
                            .toList());
        }
    }

    // ==========================================
    // 2. matchId 배열 → MatchDto 배열 조회
    // ==========================================
    
    /** matchId 배열로 MatchDto 배열 조회 */
    private Mono<List<MatchDto>> getMatchDtosByMatchIds(List<String> matchIds) {
        if (matchIds == null || matchIds.isEmpty()) {
            return Mono.just(List.of());
        }
        final int CONCURRENCY = 2; // 4 -> 2로 감소 (rate limit 방지)
        return reactor.core.publisher.Flux.fromIterable(matchIds)
                .flatMapSequential(this::getMatchDtoByMatchId, CONCURRENCY)  // 병렬 조회 + 순서 유지
                .delayElements(Duration.ofMillis(100)) // 각 요청 사이 100ms 딜레이 추가 (50ms -> 100ms)
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
                .collectList()
                .map(summaryList -> {
                    // gameCreation 기준 내림차순 정렬 (가장 최신 게임이 먼저)
                    summaryList.sort((a, b) -> {
                        long timeA = (a.getInfo() != null) ? a.getInfo().getGameCreation() : 0L;
                        long timeB = (b.getInfo() != null) ? b.getInfo().getGameCreation() : 0L;
                        return Long.compare(timeB, timeA); // 내림차순
                    });
                    return summaryList;
                });
    }

    // ==========================================
    // 4. PUBLIC API - 게임명+태그로 MatchSummaryDto 리스트 조회 (위 3개 메서드 사용)
    // ==========================================
    
    /** 게임명+태그로 최근 N개의 MatchSummaryDto 조회 (컨트롤러에서 사용, queueId로 필터링 가능) */
    public Mono<List<MatchSummaryDto>> getMatchSummaryDtosByMatchIds(String gameName, String tagLine, int count, Integer queueId) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine)  // PUUID 조회 (SummonerService)
                .flatMap(acc -> {
                    // queueId 또는 30일 필터링이 필요한 경우 더 많은 매치를 가져온 후 필터링
                    // 필터링되지 않은 매치 수를 고려하여 충분한 개수를 가져옴
                    // 30일 필터링과 queueId 필터링을 모두 고려하여 충분한 데이터 가져오기
                    int fetchCount = (queueId != null) ? count * 5 : count * 2; // queueId 필터링 시 5배, 날짜 필터링만 시 2배 더 가져오기
                    return getMatchIdsByPuuid(acc.getPuuid(), fetchCount);
                })
                .flatMap(this::getMatchDtosByMatchIds)                               // 2. matchId 배열로 MatchDto 배열 조회
                .flatMap(matchDtos -> {
                    // 30일 이내 매치만 필터링 (gameCreation 기준)
                    long currentTime = System.currentTimeMillis();
                    long thirtyDaysAgo = currentTime - (30L * 24 * 60 * 60 * 1000); // 30일 전 타임스탬프
                    
                    // queueId와 날짜 필터링
                    List<MatchDto> filtered = matchDtos.stream()
                            .filter(m -> {
                                if (m == null || m.getInfo() == null) return false;
                                
                                // 30일 이내 필터링
                                Long gameCreation = m.getInfo().getGameCreation();
                                if (gameCreation == null || gameCreation < thirtyDaysAgo) {
                                    return false;
                                }
                                
                                // queueId 필터링 (queueId가 지정된 경우만)
                                if (queueId != null) {
                                    Integer matchQueueId = m.getInfo().getQueueId();
                                    if (matchQueueId == null || !matchQueueId.equals(queueId)) {
                                        return false;
                                    }
                                }
                                
                                return true;
                            })
                            .limit(count) // 요청한 개수만큼만 반환
                            .toList();
                    
                    return getMatchSummaryDtosByMatchDtos(filtered);                 // 3. MatchDto 배열로 MatchSummaryDto 배열 변환
                });
    }

    // ==========================================
    // 5. PUBLIC API - matchId로 MatchDetailDto 조회 (상세보기)
    // ==========================================
    
    /** matchId로 MatchDetailDto 조회 (상세보기 버튼 클릭 시 사용) */
    public Mono<MatchDetailDto> getMatchDetailByMatchId(String matchId) {
        return getMatchDtoByMatchId(matchId)
                .map(this::convertMatchDtoToDetailDto);
    }

    // ==========================================
    // 6. MatchDto → MatchDetailDto 변환을 위한 헬퍼 메서드 (먼저 MatchDto로 변환 )
    // ==========================================
    
    /** matchId로 MatchDto 조회 (Riot API 원시 응답 - 내부 헬퍼 메서드, 캐싱 적용) */
    private Mono<MatchDto> getMatchDtoByMatchId(String matchId) {
        // 캐시에서 조회 (이미 요청된 matchId는 재사용)
        return matchCache.computeIfAbsent(matchId, id -> {
            Mono<MatchDto> mono = riotRegionalClient.get()
                    .uri(uri -> uri.path("/lol/match/v5/matches/{matchId}").build(id))
                    .retrieve()
                    .onStatus(s -> s.value() == 404,
                            r -> Mono.error(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Match not found: " + id)))
                    .onStatus(s -> s.value() == 429, r -> {
                        log.warn("Rate limit exceeded for matchId: {}", id);
                        return Mono.error(new ResponseStatusException(
                                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                                "API 요청 한도 초과. 잠시 후 다시 시도해주세요."));
                    })
                    .onStatus(HttpStatusCode::isError, r -> toApiError("match-by-id", r))
                    .bodyToMono(MatchDto.class)
                    .retryWhen(
                            Retry.backoff(3, Duration.ofSeconds(1)) // 300ms -> 1초로 증가
                                    .maxBackoff(Duration.ofSeconds(10)) // 5초 -> 10초로 증가
                                    .filter(ex -> {
                                        if (ex instanceof WebClientResponseException wex) {
                                            int status = wex.getStatusCode().value();
                                            return status == 429 || (status >= 500 && status < 600);
                                        }
                                        return false;
                                    })
                    )
                    .cache(Duration.ofMinutes(5)); // 5분간 캐싱 (같은 matchId 재요청 시 캐시된 결과 반환)
            
            // 10분 후 캐시에서 제거 (메모리 누수 방지) - 별도 스레드에서 처리
            Mono.delay(Duration.ofMinutes(10))
                    .then(Mono.fromRunnable(() -> matchCache.remove(id)))
                    .subscribe();
            
            return mono;
        });
    }
    // ==========================================
    // 7. MatchDto → MatchSummaryDto 변환 헬퍼 메서드 (전적 목록 카드용 )
    // ==========================================

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
            
            // 팀별 킬 수 계산 (킬관여 계산용)
            Map<Integer, Integer> teamKillsMap = new HashMap<>();
            for (MatchDto.Participant p : parts) {
                if (p == null) continue;
                Integer teamId = p.getTeamId();
                if (teamId != null) {
                    teamKillsMap.put(teamId, teamKillsMap.getOrDefault(teamId, 0) + nz(p.getKills()));
                }
            }
            
            info.setParticipants(parts.stream().map(p -> {
                ParticipantDto x = new ParticipantDto();
                x.setPuuid(p.getPuuid());
                x.setRiotIdGameName(p.getRiotIdGameName());
                x.setRiotIdTagline(p.getRiotIdTagline());
                x.setSummonerName(resolveSummonerName(p));
                x.setChampionName(p.getChampionName());
                x.setTeamId(nz(p.getTeamId()));
                x.setTeamPosition(p.getTeamPosition());
                x.setIndividualPosition(p.getIndividualPosition());
                int kills = nz(p.getKills());
                int deaths = nz(p.getDeaths());
                int assists = nz(p.getAssists());
                x.setKills(kills);
                x.setDeaths(deaths);
                x.setAssists(assists);
                x.setChampLevel(nz(p.getChampLevel()));
                x.setWin(Boolean.TRUE.equals(p.getWin()));

                // CS 합산
                int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());
                x.setCsTotal(cs);

                // 킬관여 계산: (플레이어 킬 + 플레이어 어시스트) / 팀 전체 킬
                Integer teamId = p.getTeamId();
                int teamKills = teamKillsMap.getOrDefault(teamId, 0);
                if (teamKills > 0) {
                    double kp = (double)(kills + assists) / teamKills;
                    x.setKillParticipation(kp); // 0.0~1.0 형태로 저장 (프론트엔드에서 100 곱해서 표시)
                } else {
                    x.setKillParticipation(0.0);
                }

                // 주문/룬/아이템
                x.setSummoner1Id(p.getSummoner1Id());
                x.setSummoner2Id(p.getSummoner2Id());
                x.setPrimaryStyleId(safePrimaryStyle(p));
                x.setSubStyleId(safeSubStyle(p));
                x.setKeystoneId(safeKeystone(p));
                x.setPerkIds(allPerkIds(p));
                x.setTotalDamageDealtToChampions(nz(p.getTotalDamageDealtToChampions()));
                x.setTotalDamageTaken(nz(p.getTotalDamageTaken()));
                x.setGoldEarned(p.getGoldEarned()); // 획득한 골드 설정
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
            Map<Integer, MatchDetailDto.Info.TeamDto> teamsMap = convertMatchDtoTeamsToTeamDtos(rawInfo.getTeams());

            // 참가자 정보 추출
            // 팀별 킬 수 계산 (킬관여 계산용)
            Map<Integer, Integer> teamKillsMap = new HashMap<>();
            var parts = rawInfo.getParticipants();
            if (parts != null) {
                for (MatchDto.Participant p : parts) {
                    if (p == null) continue;
                    Integer teamId = p.getTeamId();
                    if (teamId != null) {
                        teamKillsMap.put(teamId, teamKillsMap.getOrDefault(teamId, 0) + nz(p.getKills()));
                    }
                }
            }
            
            List<ParticipantDto> participants = new ArrayList<>();
            if (parts != null) {
                for (MatchDto.Participant p : parts) {
                    if (p == null) continue;
                    // 참가자 매핑
                    try {
                        participants.add(convertMatchDtoParticipantToParticipantDto(p, teamKillsMap));
                    } catch (Exception ex) {
                        log.warn("Participant parse failed: {}", ex.getMessage());
                    }
                }
            }

            // Metadata
            MatchSummaryDto.Metadata md = new MatchSummaryDto.Metadata();
            md.setMatchId(matchId);

            // Info (요약 + 팀)
            MatchDetailDto.Info info = MatchDetailDto.Info.builder()
                    .gameCreation(gameCreation)
                    .gameDuration(gameDuration)
                    .queueId(queueId)
                    .gameMode(gameMode)
                    .participants(participants)
                    .teams(teamsMap.values().stream()
                            .sorted(Comparator.comparing(MatchDetailDto.Info.TeamDto::getTeamId))
                            .toList())
                    .build();

            return MatchDetailDto.builder()
                    .metadata(md)
                    .info(info)
                    .build();

        } catch (Exception e) {
            log.error("Match detail mapping failed: {}", e.getMessage(), e);
            return emptyMatchDetail();
        }
    }

    // ==========================================
    // 8. MatchDetailDto 변환을 위한 헬퍼 메서드
    // ==========================================
    
    /** MatchDto.Participant → ParticipantDto 변환 */
    private ParticipantDto convertMatchDtoParticipantToParticipantDto(MatchDto.Participant p, Map<Integer, Integer> teamKillsMap) {
        int teamId = nz(p.getTeamId());
        int kills = nz(p.getKills());
        int deaths = nz(p.getDeaths());
        int assists = nz(p.getAssists());
        int totalDmgToChamps = nz(p.getTotalDamageDealtToChampions());
        int totalDmgTaken = nz(p.getTotalDamageTaken());
        int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());

        // 룬 정보 추출
        MatchDto.Perks perks = p.getPerks();
        Integer primaryStyle = safePrimaryStyle(p);
        Integer subStyle = safeSubStyle(p);
        Integer keystoneId = safeKeystone(p);
        List<Integer> perkIds = new ArrayList<>();
        
        if (perks != null && perks.getStyles() != null) {
            for (MatchDto.Style style : perks.getStyles()) {
                if (style != null && style.getSelections() != null) {
                    for (MatchDto.Selection sel : style.getSelections()) {
                        if (sel != null && sel.getPerk() != null) {
                            Integer perkId = sel.getPerk();
                            perkIds.add(perkId);
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
        dto.setRiotIdTagline(p.getRiotIdTagline());
        dto.setSummonerName(resolveSummonerName(p));
        dto.setChampionName(p.getChampionName());
        dto.setTeamPosition(p.getTeamPosition());
        dto.setIndividualPosition(p.getIndividualPosition());
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
        dto.setGoldEarned(p.getGoldEarned()); // 획득한 골드 설정
        
        // 킬관여 계산: (플레이어 킬 + 플레이어 어시스트) / 팀 전체 킬
        Integer participantTeamId = p.getTeamId();
        int teamKills = (teamKillsMap != null && participantTeamId != null) 
                ? teamKillsMap.getOrDefault(participantTeamId, 0) 
                : 0;
        if (teamKills > 0) {
            double kp = (double)(kills + assists) / teamKills;
            dto.setKillParticipation(kp); // 0.0~1.0 형태로 저장
        } else {
            dto.setKillParticipation(0.0);
        }
        
        return dto;
    }

    /** MatchDto.Team 리스트 → MatchDetailDto.TeamDto 변환 */
    private Map<Integer, MatchDetailDto.Info.TeamDto> convertMatchDtoTeamsToTeamDtos(List<MatchDto.Team> teams) {
        Map<Integer, MatchDetailDto.Info.TeamDto> map = new HashMap<>();
        if (teams == null) return map;
        
        for (MatchDto.Team t : teams) {
            if (t == null || t.getTeamId() == null) continue;
            
            Integer teamId = t.getTeamId();
            Boolean win = t.getWin();
            
            MatchDto.Objectives obj = t.getObjectives();
            
            MatchDetailDto.Info.TeamObjectives objectives = MatchDetailDto.Info.TeamObjectives.builder()
                    .baron(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getBaron() : null))
                    .dragon(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getDragon() : null))
                    .tower(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getTower() : null))
                    .inhibitor(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getInhibitor() : null))
                    .riftHerald(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getRiftHerald() : null))
                    .champion(convertMatchDtoObjectiveStatToObjectiveStat(obj != null ? obj.getChampion() : null))
                    .build();

            Integer champKills = (obj != null && obj.getChampion() != null) ? nz(obj.getChampion().getKills()) : 0;

            map.put(teamId, MatchDetailDto.Info.TeamDto.builder()
                    .teamId(teamId)
                    .win(win)
                    .objectives(objectives)
                    .championKills(champKills)
                    .build());
        }
        return map;
    }

    /** MatchDto.ObjectiveStat → MatchDetailDto.ObjectiveStat 변환 헬퍼 */
    private MatchDetailDto.Info.ObjectiveStat convertMatchDtoObjectiveStatToObjectiveStat(MatchDto.ObjectiveStat rawStat) {
        if (rawStat == null) {
            return MatchDetailDto.Info.ObjectiveStat.builder()
                    .kills(0)
                    .build();
        }
        return MatchDetailDto.Info.ObjectiveStat.builder()
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
        MatchSummaryDto.Metadata md = new MatchSummaryDto.Metadata();
        md.setMatchId(null);

        MatchDetailDto.Info info = MatchDetailDto.Info.builder()
                .gameCreation(0L)
                .gameDuration(0L)
                .gameMode(null)
                .queueId(null)
                .participants(List.of())
                .teams(List.of())
                .build();

        return MatchDetailDto.builder()
                .metadata(md)
                .info(info)
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
                    .flatMap(s -> {
                        var sels = s.getSelections();
                        return sels == null ? java.util.stream.Stream.<MatchDto.Selection>empty() : sels.stream();
                    })
                    .map(MatchDto.Selection::getPerk)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }
}
