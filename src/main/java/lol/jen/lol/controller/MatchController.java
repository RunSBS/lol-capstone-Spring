// src/main/java/lol/jen/lol/controller/MatchController.java
package lol.jen.lol.controller;

import lombok.RequiredArgsConstructor;
import lol.jen.lol.dto.MatchDto;
import lol.jen.lol.service.MatchService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/match")
public class MatchController {

    private final MatchService matchService;

    /** 게임명+태그로 최근 매치 N개 조회 (기본 5개) */
    @GetMapping("/recent")
    public Mono<List<MatchDto>> recent(
            @RequestParam String gameName,
            @RequestParam String tagLine,
            @RequestParam(defaultValue = "5") int count
    ) {
        return matchService.getRecentMatchesByRiotId(gameName, tagLine, count);
    }

    /** matchId 단건 조회 */
    @GetMapping("/{matchId}")
    public Mono<MatchDto> byMatchId(@PathVariable String matchId) {
        return matchService.getMatchDto(matchId);
    }
}
