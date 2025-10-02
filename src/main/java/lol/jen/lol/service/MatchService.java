// src/main/java/lol/jen/lol/service/MatchService.java
package lol.jen.lol.service;

import lombok.RequiredArgsConstructor;
import lol.jen.lol.dto.MatchDto;
import lol.jen.lol.dto.ParticipantDto;
import lol.jen.lol.dto.AccountDto;
import lol.jen.lol.dto.RawMatch;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.core.ParameterizedTypeReference; // <- 추가

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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
    public MatchDto toMatchDto(RawMatch raw) {
        MatchDto dto = new MatchDto();
        if (raw.getMetadata() != null) {
            dto.setMatchId(raw.getMetadata().getMatchId());
        }
        if (raw.getInfo() != null) {
            var info = raw.getInfo();
            dto.setGameCreation(info.getGameCreation());
            dto.setGameDuration(info.getGameDuration());
            dto.setGameMode(info.getGameMode());
            dto.setGameVersion(info.getGameVersion());

            var parts = info.getParticipants() == null ? List.<RawMatch.Participant>of() : info.getParticipants();
            dto.setParticipants(parts.stream().filter(Objects::nonNull).map(p -> {
                ParticipantDto x = new ParticipantDto();
                x.setPuuid(p.getPuuid());                              // ✅
                x.setRiotIdGameName(p.getRiotIdGameName());            // ✅
                x.setRiotIdTagline(p.getRiotIdTagline());              // ✅
                // Riot ID가 있으면 우선 표시, 없으면 기존 summonerName 사용
                x.setSummonerName(p.getRiotIdGameName() != null ? p.getRiotIdGameName() : p.getSummonerName());

                x.setChampionName(p.getChampionName());
                x.setTeamId(nz(p.getTeamId()));
                x.setKills(nz(p.getKills()));
                x.setDeaths(nz(p.getDeaths()));
                x.setAssists(nz(p.getAssists()));
                int cs = nz(p.getTotalMinionsKilled()) + nz(p.getNeutralMinionsKilled());
                x.setTotalMinionsKilled(cs);
                x.setChampLevel(nz(p.getChampLevel()));
                x.setGoldEarned(nz(p.getGoldEarned()));
                x.setWin(Boolean.TRUE.equals(p.getWin()));
                return x;
            }).collect(Collectors.toList()));
        }
        return dto;
    }


    private static int nz(Integer v) { return v == null ? 0 : v; }

    /** 게임명+태그로 최근 N개의 MatchDto */
    public Mono<List<MatchDto>> getRecentMatchesByRiotId(String gameName, String tagLine, int count) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc -> getRecentMatchIdsByPuuid(acc.getPuuid(), count))
                .flatMapMany(reactor.core.publisher.Flux::fromIterable)
                // ✅ 여기서 빈 Mono(=404 스킵)가 자동으로 걸러짐
                .flatMap(this::getRawMatch)
                .map(this::toMatchDto)
                .collectList();
    }

    /** matchId 하나를 MatchDto로 */
    public Mono<MatchDto> getMatchDto(String matchId) {
        return getRawMatch(matchId).map(this::toMatchDto);
    }
}
