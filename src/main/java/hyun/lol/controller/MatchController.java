// src/main/java/lol/jen/lol/controller/MatchController.java
package hyun.lol.controller;

import hyun.lol.dto.MatchDetailDto;
import hyun.lol.dto.MatchDto;
import hyun.lol.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    @GetMapping(value = "/recent", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<List<MatchDto>>> recent(
            @RequestParam String gameName,
            @RequestParam String tagLine,
            @RequestParam(defaultValue = "5") int count
    ) {
        return matchService.getRecentMatchesByRiotId(gameName, tagLine, count)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.noContent().build()));
    }

    /** matchId 단건 조회 */
    @GetMapping(value = "/{matchId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<MatchDto>> byMatchId(@PathVariable String matchId) {
        return matchService.getMatchDto(matchId)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    // 상세 보기 기능
    @GetMapping(value = "/{matchId}/detail", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<MatchDetailDto>> getDetail(
            @PathVariable String matchId,
            @RequestParam(defaultValue = "false") boolean includeTimeline
    ) {
        return matchService.getMatchDetail(matchId, includeTimeline)
                .doOnSubscribe(s -> log.info("[CTRL] /match/{}/detail called (includeTimeline={})", matchId, includeTimeline))
                .doOnNext(d -> log.info("[CTRL] detail built: matchId={}, participants={}",
                        d.getMatchId(), d.getParticipants() == null ? 0 : d.getParticipants().size()))
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.fromRunnable(() ->
                                log.warn("[CTRL] getMatchDetail returned EMPTY for matchId={}", matchId))
                        .then(Mono.just(ResponseEntity.notFound().build())))
                .onErrorResume(e -> {
                    log.error("[CTRL] getMatchDetail ERROR matchId={}", matchId, e);
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY).build());
                });
    }

}
