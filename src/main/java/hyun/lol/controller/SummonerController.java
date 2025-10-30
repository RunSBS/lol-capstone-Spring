package hyun.lol.controller;

import hyun.lol.dto.ViewDto;
import hyun.lol.service.SummonerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/summoner")
public class SummonerController {
    private final SummonerService summonerService;
    // UI용 통합 엔드 포인트
    @PostMapping("view/{gameName}/{tagLine}")
    public Mono<ViewDto> getViewDto(@PathVariable String gameName, @PathVariable String tagLine) {
        return summonerService.getViewDtoByGameNameAndTagLine(gameName, tagLine);
    }
}
