// src/main/java/lol/jen/lol/service/MatchService.java
package hyun.lol.service;

import com.fasterxml.jackson.databind.JsonNode;
import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchDto;
import hyun.lol.dto.ParticipantDto;
import hyun.lol.dto.RawMatch;
import hyun.lol.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.core.ParameterizedTypeReference; // <- 추가

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    @Qualifier("riotRegionalClient")
    private final WebClient riotRegionalClient;

    private final SummonerService summonerService; // puuid 조회 재사용

    /** 공통 에러 변환 */
    private static Mono<? extends Throwable> toApiError(String api, ClientResponse resp) {
        int code = resp.statusCode().value();
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> Mono.error(new RuntimeException("[RiotAPI:" + api + "] HTTP " + code + " body=" + body)));
    }

    /** puuid로 최근 matchId 목록 */
    public Mono<List<String>> getRecentMatchIdsByPuuid(String puuid, int count) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                        .queryParam("start", 0)
                        .queryParam("count", Math.max(1, Math.min(count, 20)))
                        .build(puuid))
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> toApiError("match-ids-by-puuid", r))
                // ✅ 배열 → List<String>로 정확히 디코딩
                .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                // 혹시 null 방지
                .defaultIfEmpty(List.of());
    }

    /** matchId로 RawMatch */
    public Mono<RawMatch> getRawMatch(String matchId) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/lol/match/v5/matches/{matchId}").build(matchId))
                .exchangeToMono(resp -> {
                    if (resp.statusCode().is2xxSuccessful()) {
                        return resp.bodyToMono(RawMatch.class);
                    }
                    if (resp.statusCode().value() == 404) {
                        // ✅ 개별 매치 404는 스킵
                        return Mono.empty();
                    }
                    return toApiError("match-by-id", resp).flatMap(Mono::error);
                });
    }
    /** RawMatch → MatchDto 변환 */
    // src/main/java/lol/jen/lol/service/MatchService.java
    // src/main/java/lol/jen/lol/service/MatchService.java (일부분)
    public MatchDto toMatchDto(RawMatch raw) {
        MatchDto dto = new MatchDto();
        if (raw.getMetadata() != null) dto.setMatchId(raw.getMetadata().getMatchId());
        if (raw.getInfo() != null) {
            var info = raw.getInfo();
            dto.setGameCreation(info.getGameCreation());
            dto.setGameDuration(info.getGameDuration());
            dto.setGameMode(info.getGameMode());
            dto.setGameVersion(info.getGameVersion());
            dto.setQueueId(info.getQueueId());

            var parts = info.getParticipants() == null ? List.<RawMatch.Participant>of() : info.getParticipants();
            dto.setParticipants(parts.stream().map(p -> {
                ParticipantDto x = new ParticipantDto();
                x.setPuuid(p.getPuuid());
                x.setRiotIdGameName(p.getRiotIdGameName());
                x.setRiotIdTagline(p.getRiotIdTagline());
                x.setSummonerName(p.getRiotIdGameName() != null ? p.getRiotIdGameName() : p.getSummonerName());

                x.setChampionName(p.getChampionName());
                x.setTeamId(nz(p.getTeamId()));
                x.setKills(nz(p.getKills()));
                x.setDeaths(nz(p.getDeaths()));
                x.setAssists(nz(p.getAssists()));
                x.setChampLevel(nz(p.getChampLevel()));
                x.setGoldEarned(nz(p.getGoldEarned()));
                x.setWin(Boolean.TRUE.equals(p.getWin()));

                // CS 합산
                int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());
                x.setCsTotal(cs);

                // 주문/룬/아이템/배지 (RawMatch.Participant에 필드 추가 필요)
                x.setSummoner1Id(p.getSummoner1Id());
                x.setSummoner2Id(p.getSummoner2Id());

                x.setPrimaryStyleId(safePrimaryStyle(p));
                x.setSubStyleId(safeSubStyle(p));
                x.setKeystoneId(safeKeystone(p));        // ★ 추가
                x.setPerkIds(allPerkIds(p));             // ★ 추가

                x.setItem0(p.getItem0()); x.setItem1(p.getItem1()); x.setItem2(p.getItem2());
                x.setItem3(p.getItem3()); x.setItem4(p.getItem4()); x.setItem5(p.getItem5()); x.setItem6(p.getItem6());

                x.setLargestMultiKill(p.getLargestMultiKill());
                return x;
            }).toList());
        }
        return dto;
    }

    private static Integer safePrimaryStyle(RawMatch.Participant p) {
        try {
            return p.getPerks().getStyles().get(0).getStyle();
        } catch (Exception e) {
            return null;
        }
    }
    private static Integer safeSubStyle(RawMatch.Participant p) {
        try { return p.getPerks().getStyles().get(1).getStyle(); } catch (Exception e) { return null; }
    }
    private static int nz(Integer v){ return v==null?0:v; }

    /** 게임명+태그로 최근 N개의 MatchDto */
    public Mono<List<MatchDto>> getRecentMatchesByRiotId(String gameName, String tagLine, int count) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc -> getRecentMatchIdsByPuuid(acc.getPuuid(), count))
                .flatMapMany(reactor.core.publisher.Flux::fromIterable)
                // ✅ 순서 보장: IDs 순서대로 차례로 호출
                .concatMap(this::getRawMatch)
                .map(this::toMatchDto)
                // ✅ 혹시 모를 타임스탬프 이슈 대비해서 한 번 더 정렬(최신 우선)
                .sort(Comparator.comparing(MatchDto::getGameCreation).reversed())
                .collectList();
    }

    /** matchId 하나를 MatchDto로 */
    public Mono<MatchDto> getMatchDto(String matchId) {
        return getRawMatch(matchId).map(this::toMatchDto);
    }

    /** 매치 상세 + (옵션) 타임라인 */
    public Mono<MatchDetailDto> getMatchDetail(String matchId, boolean includeTimeline) {
        Mono<JsonNode> matchMono = riotRegionalClient.get()
                .uri("/lol/match/v5/matches/{matchId}", matchId)
                .exchangeToMono(resp -> {
                    log.info("[SVC] MATCH status={}", resp.statusCode());
                    if (resp.statusCode().is2xxSuccessful()) {
                        return resp.bodyToMono(JsonNode.class)
                                .doOnNext(n -> log.info("[SVC] MATCH ok: id={}",
                                        n.path("metadata").path("matchId").asText("")));
                    }
                    if (resp.statusCode().value() == 404) {
                        return Mono.empty();
                    }
                    return toApiError("MATCH", resp).flatMap(Mono::error);
                });

        if (!includeTimeline) {
            // 타임라인 없이 바로 매핑
            return matchMono
                    .doOnNext(m -> log.info("[SVC] MATCH JsonNode arrived, has info={}, has metadata={}",
                            !m.path("info").isMissingNode(), !m.path("metadata").isMissingNode()))
                    .map(m -> {
                        log.info("[SVC] calling mapToDetailDto (no timeline)...");
                        return mapToDetailDto(m, null);
                    })
                    .doOnNext(d -> log.info("[SVC] built detail: matchId={}, parts={}, teams={}",
                            d.getMatchId(),
                            d.getParticipants()==null?-1:d.getParticipants().size(),
                            d.getTeams()==null?-1:d.getTeams().size()))
                    .switchIfEmpty(Mono.defer(() -> {
                        log.warn("[SVC] MATCH not found: {}", matchId);
                        return Mono.empty(); // 컨트롤러에서 404
                    }))
                    .onErrorResume(e -> {
                        log.error("[SVC] getMatchDetail failed: {}", e.toString(), e);
                        return Mono.just(MatchDetailDto.builder()
                                .matchId(null).gameCreation(0L).gameDuration(0L)
                                .queueId(null).gameMode(null)
                                .teams(List.of()).participants(List.of())
                                .build());
                    });
        }

        // includeTimeline=true 인 경우만 호출
        Mono<JsonNode> timelineMono = riotRegionalClient.get()
                .uri("/lol/match/v5/matches/{matchId}/timeline", matchId)
                .exchangeToMono(resp -> {
                    log.info("[SVC] TIMELINE status={}", resp.statusCode());
                    if (resp.statusCode().is2xxSuccessful()) {
                        return resp.bodyToMono(JsonNode.class)
                                .doOnNext(n -> log.info("[SVC] TIMELINE ok (has events)"));
                    }
                    if (resp.statusCode().value() == 404) {
                        // 타임라인만 없는 케이스 → 그냥 빈으로
                        return Mono.empty();
                    }
                    return toApiError("TIMELINE", resp).flatMap(Mono::error);
                });

        // 매치 + (옵션)타임라인을 함께 매핑
        return matchMono
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("[SVC] MATCH not found: {}", matchId);
                    return Mono.empty();
                }))
                .zipWith( // ⚠ null 금지 → Optional로 포장
                        timelineMono.map(Optional::of).defaultIfEmpty(Optional.empty())
                )
                .map(tuple -> {
                    JsonNode m = tuple.getT1();
                    Optional<JsonNode> tlOpt = tuple.getT2();
                    log.info("[SVC] calling mapToDetailDto (with timeline? {})", tlOpt.isPresent());
                    return mapToDetailDto(m, tlOpt.orElse(null));
                })
                .doOnNext(d -> log.info("[SVC] built detail: matchId={}, parts={}, teams={}",
                        d.getMatchId(),
                        d.getParticipants()==null?-1:d.getParticipants().size(),
                        d.getTeams()==null?-1:d.getTeams().size()))
                .onErrorResume(e -> {
                    log.error("[SVC] getMatchDetail failed: {}", e.toString(), e);
                    return Mono.just(MatchDetailDto.builder()
                            .matchId(null).gameCreation(0L).gameDuration(0L)
                            .queueId(null).gameMode(null)
                            .teams(List.of()).participants(List.of())
                            .build());
                });
    }

    /** JSON → DTO 매핑 (Jackson Tree 사용, Raw model 없어도 동작) */
    private MatchDetailDto mapToDetailDto(JsonNode match, JsonNode timeline) {
        log.info("[MAP] mapToDetailDto called: match={}, timeline={}",
                match != null, timeline != null);
        try {
            if (match == null || match.isNull()) {
                log.warn("[MAP] match JsonNode is null");
                return MatchDetailDto.builder()
                        .matchId(null)
                        .gameCreation(0L)
                        .gameDuration(0L)
                        .queueId(null)
                        .gameMode(null)
                        .teams(List.of())
                        .participants(List.of())
                        .build();
            }

            JsonNode info = match.path("info");
            JsonNode metadata = match.path("metadata");
            log.info("[MAP] info.exists={} metadata.exists={}",
                    !info.isMissingNode(), !metadata.isMissingNode());

            if (metadata.isMissingNode()) log.warn("[MAP] metadata missing");
            if (info.isMissingNode()) log.warn("[MAP] info missing");

            String matchId = metadata.path("matchId").asText(null);
            long gameCreation = safeLong(info, "gameCreation", 0L);
            long gameDuration = normalizeDuration(info);
            Integer queueId   = safeInt(info, "queueId", null);
            String gameMode   = safeText(info, "gameMode", null);

            log.info("[MAP] matchId={}, duration={}, queueId={}, mode={}",
                    matchId, gameDuration, queueId, gameMode);

            Map<Integer, MatchDetailDto.TeamDto> teamsMap =
                    info.path("teams").isMissingNode() ? new HashMap<>() : extractTeams(info);

            Map<Integer, Integer> teamKills = new HashMap<>();
            JsonNode partsNode = info.path("participants");
            log.info("[MAP] participants.size={}", partsNode.isArray() ? partsNode.size() : -1);
            if (!partsNode.isMissingNode() && partsNode.isArray()) {
                teamKills = computeTeamKills(info);
            }

            List<MatchDetailDto.ParticipantDetailDto> participants = new ArrayList<>();
            if (!partsNode.isMissingNode() && partsNode.isArray()) {
                for (JsonNode p : partsNode) {
                    try {
                        participants.add(mapParticipant(p, teamKills, gameDuration));
                    } catch (Exception ex) {
                        log.warn("[MAP] participant parse failed: {}", ex.toString());
                    }
                }
            }

            return MatchDetailDto.builder()
                    .matchId(matchId)
                    .gameCreation(gameCreation)
                    .gameDuration(gameDuration)
                    .queueId(queueId)
                    .gameMode(gameMode)
                    .teams(teamsMap.values().stream()
                            .sorted(Comparator.comparing(MatchDetailDto.TeamDto::getTeamId))
                            .toList())
                    .participants(participants)
                    .build();

        } catch (Exception e) {
            log.error("[MAP] mapToDetailDto fatal error: {}", e.toString(), e);
            return MatchDetailDto.builder()
                    .matchId(null)
                    .gameCreation(0L)
                    .gameDuration(0L)
                    .queueId(null)
                    .gameMode(null)
                    .teams(List.of())
                    .participants(List.of())
                    .build();
        }
    }


    private Map<Integer, MatchDetailDto.TeamDto> extractTeams(JsonNode info) {
        Map<Integer, MatchDetailDto.TeamDto> map = new HashMap<>();
        for (JsonNode t : info.withArray("teams")) {
            int teamId = safeInt(t, "teamId", 0);
            boolean win = t.path("win").asBoolean(false);

            JsonNode obj = t.path("objectives");
            int baron      = safeInt(obj.path("baron"), "kills", 0);
            int dragon     = safeInt(obj.path("dragon"), "kills", 0);
            int tower      = safeInt(obj.path("tower"), "kills", 0);
            int inhibitor  = safeInt(obj.path("inhibitor"), "kills", 0);
            int riftHerald = safeInt(obj.path("riftHerald"), "kills", 0);
            int champKills = safeInt(obj.path("champion"), "kills", 0);

            MatchDetailDto.TeamObjectives objectives = MatchDetailDto.TeamObjectives.builder()
                    .baron(baron).dragon(dragon).tower(tower)
                    .inhibitor(inhibitor).riftHerald(riftHerald)
                    .build();

            map.put(teamId, MatchDetailDto.TeamDto.builder()
                    .teamId(teamId)
                    .win(win)
                    .objectives(objectives)
                    .championKills(champKills)
                    .build());
        }
        return map;
    }

    private Map<Integer, Integer> computeTeamKills(JsonNode info) {
        Map<Integer, Integer> acc = new HashMap<>();
        for (JsonNode p : info.withArray("participants")) {
            int teamId = safeInt(p, "teamId", 0);
            int kills  = safeInt(p, "kills", 0);
            acc.merge(teamId, kills, Integer::sum);
        }
        return acc;
    }

    private MatchDetailDto.ParticipantDetailDto mapParticipant(JsonNode p, Map<Integer,Integer> teamKills, long gameDurationSec) {
        int teamId = safeInt(p, "teamId", 0);

        int kills = safeInt(p, "kills", 0);
        int deaths = safeInt(p, "deaths", 0);
        int assists = safeInt(p, "assists", 0);

        int totalDmgToChamps = safeInt(p, "totalDamageDealtToChampions", 0);
        int totalDmgTaken    = safeInt(p, "totalDamageTaken", 0);
        int visionScore      = safeInt(p, "visionScore", 0);
        int wardsPlaced      = safeInt(p, "wardsPlaced", 0);
        int wardsKilled      = safeInt(p, "wardsKilled", 0);
        int goldEarned       = safeInt(p, "goldEarned", 0);
        int cs               = safeInt(p, "totalMinionsKilled", 0) + safeInt(p, "neutralMinionsKilled", 0);

        // 파생 지표
        double kda = deaths == 0 ? (kills + assists) : ((double)(kills + assists) / deaths);
        int tk = teamKills.getOrDefault(teamId, 0);
        double kp = (tk == 0) ? 0.0 : ((double)(kills + assists) / tk);
        double dpm = gameDurationSec <= 0 ? 0.0 : (totalDmgToChamps / (gameDurationSec / 60.0));

        // 룬 정보
        JsonNode perks = p.path("perks").path("styles");
        Integer primaryStyle = null, subStyle = null;
        List<Integer> perkIds = new ArrayList<>();
        for (JsonNode style : perks) {
            if (style.hasNonNull("style")) {
                int styleId = style.path("style").asInt();
                if (primaryStyle == null) primaryStyle = styleId;
                else subStyle = styleId;
            }
            for (JsonNode sel : style.withArray("selections")) {
                perkIds.add(sel.path("perk").asInt());
            }
        }

        return MatchDetailDto.ParticipantDetailDto.builder()
                .participantId(safeInt(p, "participantId", 0))
                .teamId(teamId)
                .puuid(safeText(p, "puuid", null))
                .summonerName(safeText(p, "summonerName", null))
                .championName(safeText(p, "championName", null))
                .championId(safeInt(p, "championId", null))

                .role(safeText(p, "teamPosition", safeText(p, "role", null)))
                .lane(safeText(p, "lane", null))

                .spell1Id(safeInt(p, "summoner1Id", null))
                .spell2Id(safeInt(p, "summoner2Id", null))

                .perkPrimaryStyle(primaryStyle)
                .perkSubStyle(subStyle)
                .perkIds(perkIds)

                .kills(kills).deaths(deaths).assists(assists)
                .totalDamageDealtToChampions(totalDmgToChamps)
                .totalDamageTaken(totalDmgTaken)
                .visionScore(visionScore)
                .wardsPlaced(wardsPlaced)
                .wardsKilled(wardsKilled)
                .goldEarned(goldEarned)
                .cs(cs)

                .item0(safeInt(p, "item0", null))
                .item1(safeInt(p, "item1", null))
                .item2(safeInt(p, "item2", null))
                .item3(safeInt(p, "item3", null))
                .item4(safeInt(p, "item4", null))
                .item5(safeInt(p, "item5", null))
                .item6(safeInt(p, "item6", null))

                .kda(round2(kda))
                .killParticipation(round3(kp))
                .dpm(round1(dpm))
                .build();
    }

    // ===== 유틸 =====
    private long normalizeDuration(JsonNode info) {
        // Riot은 gameDuration을 sec 또는 ms로 준 적이 있어서 안전하게 보정
        long sec = info.path("gameDuration").asLong(0L);
        if (sec > 0 && sec < 60_000) {
            return sec; // 이미 sec
        }
        long ms = info.path("gameEndTimestamp").asLong(0L) - info.path("gameStartTimestamp").asLong(0L);
        if (ms > 0) return ms / 1000;
        return sec; // 실패하면 원본
    }
    private static int safeInt(JsonNode n, String field, Integer def) {
        JsonNode v = n.path(field);
        return v.isMissingNode() || v.isNull() ? (def==null?0:def) : v.asInt();
    }
    private static String safeText(JsonNode n, String field, String def) {
        JsonNode v = n.path(field);
        return v.isMissingNode() || v.isNull() ? def : v.asText();
    }
    private static long safeLong(JsonNode n, String field, long def) {
        JsonNode v = n.path(field);
        return v.isMissingNode() || v.isNull() ? def : v.asLong(def);
    }
    private static Integer safeKeystone(RawMatch.Participant p) {
        try { return p.getPerks().getStyles().get(0).getSelections().get(0).getPerk(); } catch (Exception e) { return null; }
    }
    private static List<Integer> allPerkIds(RawMatch.Participant p) {
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
    private static Double round1(double d){ return Math.round(d*10.0)/10.0; }
    private static Double round2(double d){ return Math.round(d*100.0)/100.0; }
    private static Double round3(double d){ return Math.round(d*1000.0)/1000.0; }
}
