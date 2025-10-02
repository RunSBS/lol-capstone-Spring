package lol.jen.lol.controller;

import lol.jen.lol.dto.AccountDto;
import lol.jen.lol.dto.LeagueEntryDto;
import lol.jen.lol.dto.SummonerDto;
import lol.jen.lol.dto.ViewDto;
import lol.jen.lol.service.SummonerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

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
    // 디버깅/로직용 AccountDto 받아 오기
    @GetMapping("/accountDto/{gameName}/{tagLine}")
    public Mono<AccountDto> getAccountDtoByGameNameAndTagLine(@PathVariable String gameName, @PathVariable String tagLine) {
        return summonerService.getAccountDtoByGameNameAndTagLine(gameName, tagLine);
    }
    // 디버깅/로직용 SummonerDto 받아 오기
    @GetMapping("/summonerDto/{puuid}")
    public Mono<SummonerDto> getSummonerDtoBypuuid(@PathVariable String puuid) {
        return summonerService.getSummonerDtoByPuuid(puuid);
    }
    // 디버깅/로직용 LeagueEntryDto 받아 오기
    @GetMapping("/leagueEntryDto/{puuid}")
    public Mono<List<LeagueEntryDto>> getLeagueEntryDtoBypuuid(@PathVariable String puuid) {
        return summonerService.getLeagueEntryDtoByPuuid(puuid);
    }
}
