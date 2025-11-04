// src/main/java/lol/jen/lol/controller/MatchController.java
package hyun.lol.controller;

import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchSummaryDto;
import hyun.lol.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/match")
public class MatchController {

    private final MatchService matchService;

    /** 게임명+태그로 최근 매치 N개 조회 (기본 5개) */
    @GetMapping("/recent")
    public Mono<List<MatchSummaryDto>> recent(
            @RequestParam String gameName,
            @RequestParam String tagLine,
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(required = false) Integer queueId
    ) {
        return matchService.getMatchSummaryDtosByMatchIds(gameName, tagLine, count, queueId)
                .doOnError(e -> {
                    if (e instanceof org.springframework.web.server.ResponseStatusException rse) {
                        if (rse.getStatusCode().value() == 429) {
                            log.error("Rate limit error for {}/{}: {}", gameName, tagLine, rse.getMessage());
                        }
                    }
                });
    }

    /** 매치 상세 조회 */
    @GetMapping("/detail/{matchId}")
    public Mono<MatchDetailDto> getDetail(@PathVariable String matchId) {
        return matchService.getMatchDetailByMatchId(matchId)
                .doOnError(e -> log.error("Match detail error for {}: {}", matchId, e.getMessage()));
    }

}
