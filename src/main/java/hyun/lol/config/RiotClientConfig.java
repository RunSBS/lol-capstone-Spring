package hyun.lol.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class RiotClientConfig {
    @Value("${riot.api-key}")
    private String apiKey;

    @Value("${riot.platform-host}")
    private String platformHost;

    @Value("${riot.regional-host}")
    private String regionalHost;

    /** 공통 로깅(개발용) */
    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            // 토큰, 개인정보는 찍지 말기
            // 요청이 들어 오면 가로 채어 로그를 찍어줌.
            // ➡️ GET https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/나는김재현/KR1
            System.out.println("➡️ " + req.method() + " " + req.url());
            return Mono.just(req);
        });
    }
    private WebClient buildClient(String baseHost) {
        // Netty HttpClient 블록
        HttpClient httpClient = HttpClient.create()
                // TCP 연결이 5초를 넘으면 실패
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                //응답 전체 ( 헤더 + 바디 ) 수신이 10초를 넘으면 실패
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn -> conn
                        // 연결 후 읽기가 10초동안 활동이없으면 실패
                        .addHandlerLast(new ReadTimeoutHandler(10, TimeUnit.SECONDS))
                        // 쓰기가 10초동안 활동이 없으면 실패
                        .addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));
        // WebClient 블록
        return WebClient.builder()
                // 기본 도메인 고정, 이후에 .uri("/lol/...") 처럼 상대 경로만 적으면 됨.
                .baseUrl("https://" + baseHost)
                // JSON 값을 기대
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                // 모든 요청에 인증키 자동 첨부
                .defaultHeader("X-Riot-Token", apiKey)
                // 위에서 만든 Netty 타임아웃 정책을 적용시킴.
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                // 로깅 설정 ( 필터 )
                .filter(logRequest())
                // 완성
                .build();
    }

    @Bean("riotPlatformClient")
    public WebClient riotPlatformClient() {
        return buildClient(platformHost);
    }

    @Bean("riotRegionalClient")
    public WebClient riotRegionalClient() {
        return buildClient(regionalHost);
    }
}
