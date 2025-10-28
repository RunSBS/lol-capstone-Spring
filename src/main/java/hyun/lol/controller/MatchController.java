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

    /** 매치 상세 정보 조회 (프론트엔드: /match/detail/{matchId}) */
    @GetMapping(value = "/detail/{matchId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<MatchDetailDto>> getDetail(
            @PathVariable String matchId,
            @RequestParam(required = false) Boolean useCache
    ) {
        // useCache 파라미터는 무시하고 항상 상세 정보 반환
        return matchService.getMatchDetail(matchId)
                .doOnSubscribe(s -> log.info("[CTRL] /match/detail/{} called (useCache={})", matchId, useCache))
                .doOnNext(d -> log.info("[CTRL] detail built: matchId={}, participants={}",
                        d.getMatch()!=null?d.getMatch().getMatchId():null, 
                        d.getMatch()!=null&&d.getMatch().getParticipants()!=null?d.getMatch().getParticipants().size():0))
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
