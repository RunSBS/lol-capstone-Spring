package lol.jen.lol.service;

import lol.jen.lol.dto.AccountDto;
import lol.jen.lol.dto.LeagueEntryDto;
import lol.jen.lol.dto.SummonerDto;
import lol.jen.lol.dto.ViewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class SummonerService {
    @Qualifier("riotPlatformClient")
    private final WebClient platformClient;
    @Qualifier("riotRegionalClient")
    private final WebClient riotRegionalClient;

    public SummonerService(
            @Qualifier("riotPlatformClient") WebClient platformClient,
            @Qualifier("riotRegionalClient") WebClient riotRegionalClient
    ) {
        this.platformClient = platformClient;
        this.riotRegionalClient = riotRegionalClient;
    }

    /** 공통 에러 변환, 에러발생시 사용할 메서드 */
    private static Mono<? extends Throwable> toApiError(String api, ClientResponse resp) {
        int code = resp.statusCode().value();
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("") // body가 없을 수도 있음
                .flatMap(body -> {
                    String msg = "[RiotAPI:" + api + "] HTTP " + code + " body=" + body;
                    return Mono.error(new RuntimeException(msg));
                });
    }
    /** 닉네임 + 태그로 AccountDto 반환 */
    public Mono<AccountDto> getAccountDtoByGameNameAndTagLine(String gameName, String tagLine) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                .build(gameName, tagLine))
                // 여기부터 역직렬화 하겠다
                .retrieve()
                // 상태코드가 에러일경우, 에러코드를 던지자
                .onStatus(HttpStatusCode::isError, r -> toApiError("account-by-gameName-tagLine", r))
                // 결과를 dto에 저장
                .bodyToMono(AccountDto.class);
    }
    /** puuid로 SummonerDto 반환 */
    public Mono<SummonerDto> getSummonerDtoByPuuid(String puuid) {
        return platformClient.get()
                .uri(uri -> uri.path("/lol/summoner/v4/summoners/by-puuid/{puuid}")
                                        .build(puuid))
                // 여기부터 역직렬화 하겠다
                .retrieve()
                // 상태코드가 에러일경우, 에러코드를 던지자
                .onStatus(HttpStatusCode::isError, r -> toApiError("summoner-by-puuid", r))
                // 결과를 dto에 저장
                .bodyToMono(SummonerDto.class);
    }
    public Mono<ViewDto> getViewDtoByGameNameAndTagLine(String gameName, String tagLine){
        return getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc ->
                        Mono.zip(
                                getSummonerDtoByPuuid(acc.getPuuid()),
                                getLeagueEntryDtoByPuuid(acc.getPuuid())
                        ).map(tuple -> {
                            SummonerDto sum = tuple.getT1();
                            List<LeagueEntryDto> leagues = tuple.getT2();

                            LeagueEntryDto solo = leagues.stream()
                                    .filter(l -> "RANKED_SOLO_5x5".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            LeagueEntryDto flex = leagues.stream()
                                    .filter(l -> "RANKED_FLEX_SR".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            LeagueEntryDto tft = leagues.stream()
                                    .filter(l -> "RANKED_TFT".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            ViewDto viewDto = new ViewDto();
                            // Account
                            viewDto.setPuuid(acc.getPuuid());
                            viewDto.setGameName(acc.getGameName());
                            viewDto.setTagLine(acc.getTagLine());
                            // Summoner
                            viewDto.setProfileIconId(sum.getProfileIconId());
                            viewDto.setRevisionDate(sum.getRevisionDate());
                            viewDto.setSummonerLevel(sum.getSummonerLevel());
                            // League (큐 타입별로 분리 저장)
                            viewDto.setSoloRanked(solo);
                            viewDto.setFlexRanked(flex);
                            viewDto.setTftRanked(tft);
                            return viewDto;
                        })
                );
    }
    /* puuid로 LeagueEntryDto 목록 반환 */
    public Mono<List<LeagueEntryDto>> getLeagueEntryDtoByPuuid(String puuid){
        return platformClient.get()
                .uri(uri -> uri.path("/lol/league/v4/entries/by-puuid/{puuid}")
                        .build(puuid))
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> toApiError("leagueEntryDto-by-puuid", r))
                .bodyToFlux(LeagueEntryDto.class)   // <-- 배열 응답
                .collectList();
    }
}
