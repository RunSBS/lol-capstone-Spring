package lol.jen.lol.controller;

import lol.jen.lol.dto.AccountDto;
import lol.jen.lol.dto.SummonerDto;
import lol.jen.lol.dto.ViewDto;
import lol.jen.lol.service.SummonerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lol/summoner")
public class SummonerController {
    private final SummonerService summonerService;
    // UI용 통합 엔드 포인트
    @PostMapping("view/{gameName}/{tagLine}")
    public Mono<ViewDto> getViewDto(@PathVariable String gameName, @PathVariable String tagLine) {
        return summonerService.getViewDtoByGameNameAndTagLine(gameName, tagLine);
    }
    // 디버깅용 AccountDto 받아 오기
    @GetMapping("/search/{gameName}/{tagLine}")
    public Mono<AccountDto> getAccountDtoByGameNameAndTagLine(@PathVariable String gameName, @PathVariable String tagLine) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine);
    }
    // 디버깅용 SummonerDto 받아 오기
    @GetMapping("/by-puuid/{puuid}")
    public Mono<SummonerDto> getSummonerDtoBypuuid(@PathVariable String puuid) {
        return summonerService.getSummonerDtoByPuuid(puuid);
    }
}
