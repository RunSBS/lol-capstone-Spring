package lol.jen.lol.service;

import lol.jen.lol.dto.AccountDto;
import lol.jen.lol.dto.SummonerDto;
import lol.jen.lol.dto.ViewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
    /** AccountDto + SummonerDto 합친 ViewDto 반환 ( View페이지용 Dto ) */
    public Mono<ViewDto> getViewDtoByGameNameAndTagLine(String gameName, String tagLine){
        return getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc ->
                        getSummonerDtoByPuuid(acc.getPuuid())
                        .map(sum -> {
                            ViewDto viewDto = new ViewDto();
                            // Account 쪽
                            viewDto.setPuuid(acc.getPuuid());
                            viewDto.setGameName(acc.getGameName());
                            viewDto.setTagLine(acc.getTagLine());
                            // Summoner 쪽
                            viewDto.setProfileIconId(sum.getProfileIconId());
                            viewDto.setRevisionDate(sum.getRevisionDate());
                            viewDto.setSummonerLevel(sum.getSummonerLevel());
                            return viewDto;
                        })
                );
    }
}
