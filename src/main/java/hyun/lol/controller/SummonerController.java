package hyun.lol.controller;

import hyun.lol.dto.ChampionMasteryDto;
import hyun.lol.dto.PlayedWithDto;
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
}
