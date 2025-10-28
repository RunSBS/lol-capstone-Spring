// src/main/java/lol/jen/lol/service/MatchService.java
package hyun.lol.service;

import com.fasterxml.jackson.databind.JsonNode;
import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchDto;
import hyun.lol.dto.ParticipantDto;
import hyun.lol.dto.RawMatch;
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
            dto.setQueueId(info.getQueueId());

            var parts = info.getParticipants() == null ? List.<RawMatch.Participant>of() : info.getParticipants();
            dto.setParticipants(parts.stream().map(p -> {
                ParticipantDto x = new ParticipantDto();
                x.setPuuid(p.getPuuid());
                x.setRiotIdGameName(p.getRiotIdGameName());
                x.setSummonerName(p.getRiotIdGameName() != null ? p.getRiotIdGameName() : p.getSummonerName());
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

    /** 매치 상세 정보 조회 */
    public Mono<MatchDetailDto> getMatchDetail(String matchId) {
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

        return matchMono
                .doOnNext(m -> log.info("[SVC] MATCH JsonNode arrived, has info={}, has metadata={}",
                        !m.path("info").isMissingNode(), !m.path("metadata").isMissingNode()))
                .map(m -> {
                    log.info("[SVC] calling mapToDetailDto...");
                    return mapToDetailDto(m, null);
                })
                .doOnNext(d -> log.info("[SVC] built detail: matchId={}, parts={}, teams={}",
                        d.getMatch()!=null?d.getMatch().getMatchId():null,
                        d.getMatch()!=null&&d.getMatch().getParticipants()!=null?d.getMatch().getParticipants().size():-1,
                        d.getTeams()==null?-1:d.getTeams().size()))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("[SVC] MATCH not found: {}", matchId);
                    return Mono.empty();
                }))
                .onErrorResume(e -> {
                    log.error("[SVC] getMatchDetail failed: {}", e.toString(), e);
                    return Mono.just(MatchDetailDto.builder()
                            .match(new MatchDto())
                            .teams(List.of())
                            .build());
                });
    }

    /** JSON → DTO 매핑 (Jackson Tree 사용) */
    private MatchDetailDto mapToDetailDto(JsonNode match, JsonNode timeline) {
        log.info("[MAP] mapToDetailDto called");
        try {
            if (match == null || match.isNull()) {
                log.warn("[MAP] match JsonNode is null");
                return MatchDetailDto.builder()
                        .match(new MatchDto())
                        .teams(List.of())
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

            List<ParticipantDto> participants = new ArrayList<>();
            if (!partsNode.isMissingNode() && partsNode.isArray()) {
                for (JsonNode p : partsNode) {
                    try {
                        participants.add(mapParticipant(p, teamKills, gameDuration));
                    } catch (Exception ex) {
                        log.warn("[MAP] participant parse failed: {}", ex.toString());
                    }
                }
            }

            // MatchDto 생성
            MatchDto matchDto = new MatchDto();
            matchDto.setMatchId(matchId);
            matchDto.setGameCreation(gameCreation);
            matchDto.setGameDuration(gameDuration);
            matchDto.setQueueId(queueId);
            matchDto.setGameMode(gameMode);
            matchDto.setParticipants(participants);

            return MatchDetailDto.builder()
                    .match(matchDto)
                    .teams(teamsMap.values().stream()
                            .sorted(Comparator.comparing(MatchDetailDto.TeamDto::getTeamId))
                            .toList())
                    .build();

        } catch (Exception e) {
            log.error("[MAP] mapToDetailDto fatal error: {}", e.toString(), e);
            return MatchDetailDto.builder()
                    .match(new MatchDto())
                    .teams(List.of())
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

    private ParticipantDto mapParticipant(JsonNode p, Map<Integer,Integer> teamKills, long gameDurationSec) {
        int teamId = safeInt(p, "teamId", 0);
        int kills = safeInt(p, "kills", 0);
        int deaths = safeInt(p, "deaths", 0);
        int assists = safeInt(p, "assists", 0);
        int totalDmgToChamps = safeInt(p, "totalDamageDealtToChampions", 0);
        int totalDmgTaken = safeInt(p, "totalDamageTaken", 0);
        int cs = safeInt(p, "totalMinionsKilled", 0) + safeInt(p, "neutralMinionsKilled", 0);

        // 룬 정보 추출
        JsonNode perks = p.path("perks").path("styles");
        Integer primaryStyle = null, subStyle = null;
        Integer keystoneId = null;
        List<Integer> perkIds = new ArrayList<>();
        
        for (JsonNode style : perks) {
            if (style.hasNonNull("style")) {
                int styleId = style.path("style").asInt();
                if (primaryStyle == null) primaryStyle = styleId;
                else subStyle = styleId;
            }
            for (JsonNode sel : style.withArray("selections")) {
                Integer perkId = sel.path("perk").asInt(0);
                perkIds.add(perkId);
                if (primaryStyle != null && keystoneId == null && sel.path("var1").asInt() != 0) {
                    keystoneId = perkId;
                }
            }
        }
        
        // 첫 번째 perkId를 keystone으로 사용
        if (keystoneId == null && !perkIds.isEmpty()) {
            keystoneId = perkIds.get(0);
        }

        ParticipantDto dto = new ParticipantDto();
        dto.setTeamId(teamId);
        dto.setPuuid(safeText(p, "puuid", null));
        dto.setRiotIdGameName(safeText(p, "riotIdGameName", null));
        dto.setSummonerName(safeText(p, "summonerName", null));
        dto.setChampionName(safeText(p, "championName", null));
        dto.setKills(kills);
        dto.setDeaths(deaths);
        dto.setAssists(assists);
        dto.setWin(p.path("win").asBoolean(false));
        dto.setChampLevel(safeInt(p, "champLevel", 0));
        dto.setSummoner1Id(safeInt(p, "summoner1Id", null));
        dto.setSummoner2Id(safeInt(p, "summoner2Id", null));
        dto.setPrimaryStyleId(primaryStyle);
        dto.setSubStyleId(subStyle);
        dto.setKeystoneId(keystoneId);
        dto.setPerkIds(perkIds);
        dto.setItem0(safeInt(p, "item0", null));
        dto.setItem1(safeInt(p, "item1", null));
        dto.setItem2(safeInt(p, "item2", null));
        dto.setItem3(safeInt(p, "item3", null));
        dto.setItem4(safeInt(p, "item4", null));
        dto.setItem5(safeInt(p, "item5", null));
        dto.setItem6(safeInt(p, "item6", null));
        dto.setCsTotal(cs);
        dto.setTotalDamageDealtToChampions(totalDmgToChamps);
        dto.setTotalDamageTaken(totalDmgTaken);
        return dto;
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
