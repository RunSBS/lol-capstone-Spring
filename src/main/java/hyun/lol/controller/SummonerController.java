package hyun.lol.controller;

import hyun.lol.dto.AutocompleteDto;
import hyun.lol.dto.ChampionMasteryDto;
import hyun.lol.dto.PlayedWithDto;
import hyun.lol.dto.PositionDto;
import hyun.lol.dto.ViewDto;
import hyun.lol.service.SummonerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/summoner")
public class SummonerController {
    private final SummonerService summonerService;
    
    // UI용 통합 엔드 포인트
    @GetMapping("view/{gameName}/{tagLine}")
    public Mono<ViewDto> getViewDto(@PathVariable String gameName, @PathVariable String tagLine) {
        return summonerService.getViewDtoByGameNameAndTagLine(gameName, tagLine);
    }
    
    /** 챔피언 숙련도 상위 4개 조회 */
    @GetMapping("mastery/{gameName}/{tagLine}")
    public Mono<List<ChampionMasteryDto>> getChampionMastery(
            @PathVariable String gameName,
            @PathVariable String tagLine
    ) {
        return summonerService.getChampionMasteryByGameNameAndTagLine(gameName, tagLine);
    }
    
    /** 함께 플레이한 소환사 상위 5명 조회 */
    @GetMapping("played-with/{gameName}/{tagLine}")
    public Mono<List<PlayedWithDto>> getPlayedWith(
            @PathVariable String gameName,
            @PathVariable String tagLine
    ) {
        return summonerService.getPlayedWithByGameNameAndTagLine(gameName, tagLine);
    }
    
    /** 최근 N게임 포지션 데이터 조회 */
    @GetMapping("positions/{gameName}/{tagLine}")
    public Mono<List<PositionDto>> getPositions(
            @PathVariable String gameName,
            @PathVariable String tagLine,
            @RequestParam(defaultValue = "20") int count
    ) {
        return summonerService.getPositionsByGameNameAndTagLine(gameName, tagLine, count);
    }
    
    /** 자동완성 검색 */
    @GetMapping("autocomplete")
    public Mono<List<AutocompleteDto>> autocomplete(@RequestParam String q) {
        return summonerService.autocompleteSearch(q)
                .onErrorResume(e -> {
                    // Rate limit 에러인 경우 에러 상태 코드와 함께 전파
                    if (e instanceof org.springframework.web.server.ResponseStatusException rse) {
                        if (rse.getStatusCode().value() == 429) {
                            return Mono.error(rse);
                        }
                    }
                    // 다른 에러는 빈 리스트 반환
                    return Mono.just(java.util.Collections.emptyList());
                });
    }
}
