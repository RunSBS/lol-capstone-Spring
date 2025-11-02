package hyun.lol.service;

import hyun.lol.dto.AccountDto;
import hyun.lol.dto.ChampionMasteryDto;
import hyun.lol.dto.LeagueEntryDto;
import hyun.lol.dto.MatchSummaryDto;
import hyun.lol.dto.PlayedWithDto;
import hyun.lol.dto.SummonerDto;
import hyun.lol.dto.ViewDto;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SummonerService {
    @Qualifier("riotPlatformClient")
    private final WebClient platformClient;
    @Qualifier("riotRegionalClient")
    private final WebClient riotRegionalClient;
    
    private final MatchService matchService; // 함께 플레이한 소환사 조회용

    public SummonerService(
            @Qualifier("riotPlatformClient") WebClient platformClient,
            @Qualifier("riotRegionalClient") WebClient riotRegionalClient,
            @Lazy MatchService matchService
    ) {
        this.platformClient = platformClient;
        this.riotRegionalClient = riotRegionalClient;
        this.matchService = matchService;
    }

    /** 공통 에러 변환, 에러발생시 사용할 메서드 */
    private static Mono<? extends Throwable> toApiError(String api, ClientResponse resp) {
        int code = resp.statusCode().value();
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("") // body가 없을 수도 있음
                .flatMap(body -> {
                    String msg = "[RiotAPI:" + api + "] HTTP " + code + " body=" + body;
                    return Mono.error(new RuntimeException(msg));
                });
    }
    /** 닉네임 + 태그로 AccountDto 반환 */
    public Mono<AccountDto> getAccountDtoByGameNameAndTagLine(String gameName, String tagLine) {
        return riotRegionalClient.get()
                .uri(uri -> uri.path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                .build(gameName, tagLine))
                // 여기부터 역직렬화 하겠다
                .retrieve()
                // 상태코드가 에러일경우, 에러코드를 던지자
                .onStatus(HttpStatusCode::isError, r -> toApiError("account-by-gameName-tagLine", r))
                // 결과를 dto에 저장
                .bodyToMono(AccountDto.class);
    }
    /** puuid로 SummonerDto 반환 */
    public Mono<SummonerDto> getSummonerDtoByPuuid(String puuid) {
        return platformClient.get()
                .uri(uri -> uri.path("/lol/summoner/v4/summoners/by-puuid/{puuid}")
                                        .build(puuid))
                // 여기부터 역직렬화 하겠다
                .retrieve()
                // 상태코드가 에러일경우, 에러코드를 던지자
                .onStatus(HttpStatusCode::isError, r -> toApiError("summoner-by-puuid", r))
                // 결과를 dto에 저장
                .bodyToMono(SummonerDto.class);
    }
    public Mono<ViewDto> getViewDtoByGameNameAndTagLine(String gameName, String tagLine){
        return getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc ->
                        Mono.zip(
                                getSummonerDtoByPuuid(acc.getPuuid()),
                                getLeagueEntryDtoByPuuid(acc.getPuuid())
                        ).map(tuple -> {
                            SummonerDto sum = tuple.getT1();
                            List<LeagueEntryDto> leaguesRaw = tuple.getT2();
                            List<LeagueEntryDto> leagues = (leaguesRaw != null) ? leaguesRaw : Collections.emptyList();

                            // 👇 추가
                            System.out.println("[SVC] leagues size=" + leagues.size());

                            LeagueEntryDto solo = leagues.stream()
                                    .filter(l -> "RANKED_SOLO_5x5".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            LeagueEntryDto flex = leagues.stream()
                                    .filter(l -> "RANKED_FLEX_SR".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            LeagueEntryDto tft = leagues.stream()
                                    .filter(l -> "RANKED_TFT".equals(l.getQueueType()))
                                    .findFirst().orElse(null);

                            ViewDto viewDto = new ViewDto();
                            // Account
                            viewDto.setPuuid(acc.getPuuid());
                            viewDto.setGameName(acc.getGameName());
                            viewDto.setTagLine(acc.getTagLine());
                            // Summoner
                            viewDto.setProfileIconId(sum.getProfileIconId());
                            viewDto.setRevisionDate(sum.getRevisionDate());
                            viewDto.setSummonerLevel(sum.getSummonerLevel());
                            // League (큐 타입별로 분리 저장)
                            viewDto.setSoloRanked(solo);
                            viewDto.setFlexRanked(flex);
                            viewDto.setTftRanked(tft);
                            return viewDto;
                        })
                );
    }
    /* puuid로 LeagueEntryDto 목록 반환 */
    public Mono<List<LeagueEntryDto>> getLeagueEntryDtoByPuuid(String puuid){
        return platformClient.get()
                .uri(uri -> uri.path("/lol/league/v4/entries/by-puuid/{puuid}")
                        .build(puuid))
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> toApiError("leagueEntryDto-by-puuid", r))
                .bodyToFlux(LeagueEntryDto.class)   // <-- 배열 응답
                .collectList();
    }
    
    // ==========================================
    // 챔피언 숙련도 조회
    // ==========================================
    
    /** 게임명+태그로 챔피언 숙련도 상위 4개 조회 */
    public Mono<List<ChampionMasteryDto>> getChampionMasteryByGameNameAndTagLine(String gameName, String tagLine) {
        return getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc -> getChampionMasteryByPuuid(acc.getPuuid()))
                .map(masteries -> {
                    // 포인트 기준 내림차순 정렬 후 상위 4개만 선택
                    return masteries.stream()
                            .sorted((a, b) -> {
                                int pointsA = a.getChampionPoints() != null ? a.getChampionPoints() : 0;
                                int pointsB = b.getChampionPoints() != null ? b.getChampionPoints() : 0;
                                return Integer.compare(pointsB, pointsA);
                            })
                            .limit(4)
                            .map(this::enrichChampionMasteryDto)
                            .collect(Collectors.toList());
                });
    }
    
    /** puuid로 챔피언 숙련도 목록 조회 (Riot API 호출) */
    private Mono<List<ChampionMasteryDto>> getChampionMasteryByPuuid(String puuid) {
        // 플랫폼 API에서 summonerId(id)를 먼저 조회해야 함
        return getSummonerDtoByPuuid(puuid)
                .flatMap(summoner -> {
                    String summonerId = summoner.getId();
                    if (summonerId == null || summonerId.isEmpty()) {
                        return Mono.just(Collections.<ChampionMasteryDto>emptyList());
                    }
                    // Riot API v4는 encryptedSummonerId(id) 기반
                    return platformClient.get()
                            .uri(uri -> uri.path("/lol/champion-mastery/v4/champion-masteries/by-summoner/{encryptedSummonerId}")
                                    .build(summonerId))
                            .retrieve()
                            .onStatus(HttpStatusCode::isError, r -> toApiError("champion-mastery-by-summoner-id", r))
                            .bodyToFlux(ChampionMasteryDto.class)
                            .collectList()
                            .onErrorReturn(Collections.emptyList()); // 에러 시 빈 리스트 반환
                })
                .onErrorReturn(Collections.emptyList()); // 최종 에러 시 빈 리스트 반환
    }
    
    /** ChampionMasteryDto에 챔피언 이름, 이미지 URL, 포맷된 포인트 추가 */
    private ChampionMasteryDto enrichChampionMasteryDto(ChampionMasteryDto dto) {
        Long champId = dto.getChampionId();
        if (champId == null) {
            return dto;
        }
        
        // 챔피언 ID -> 이름 매핑 (주요 챔피언만, 필요시 확장)
        String champName = getChampionNameById(champId);
        dto.setName(champName);
        
        // 이미지 URL 생성 (프론트엔드에서 버전을 받아 처리하므로 이름만 전달)
        // 실제 이미지 URL은 프론트엔드에서 buildChampionSquareUrl로 생성
        dto.setImageUrl(""); // 프론트엔드에서 처리
        
        // 포인트 포맷팅 (예: "86,541")
        Integer points = dto.getChampionPoints();
        if (points != null) {
            DecimalFormat df = new DecimalFormat("#,###");
            dto.setPoints(df.format(points));
        } else {
            dto.setPoints("0");
        }
        
        return dto;
    }
    
    /** 챔피언 ID로 이름 반환 (간단 매핑) */
    private String getChampionNameById(Long championId) {
        // 주요 챔피언 ID 매핑 (필요시 확장)
        Map<Long, String> championMap = new HashMap<>();
        championMap.put(1L, "Annie");
        championMap.put(2L, "Olaf");
        championMap.put(3L, "Galio");
        championMap.put(4L, "TwistedFate");
        championMap.put(5L, "XinZhao");
        championMap.put(6L, "Urgot");
        championMap.put(7L, "LeBlanc");
        championMap.put(8L, "Vladimir");
        championMap.put(9L, "Fiddlesticks");
        championMap.put(10L, "Kayle");
        championMap.put(11L, "MasterYi");
        championMap.put(12L, "Alistar");
        championMap.put(13L, "Ryze");
        championMap.put(14L, "Sion");
        championMap.put(15L, "Sivir");
        championMap.put(16L, "Soraka");
        championMap.put(17L, "Teemo");
        championMap.put(18L, "Tristana");
        championMap.put(19L, "Warwick");
        championMap.put(20L, "Nunu");
        championMap.put(21L, "MissFortune");
        championMap.put(22L, "Ashe");
        championMap.put(23L, "Tryndamere");
        championMap.put(24L, "Jax");
        championMap.put(25L, "Morgana");
        championMap.put(26L, "Zilean");
        championMap.put(27L, "Singed");
        championMap.put(28L, "Evelynn");
        championMap.put(29L, "Twitch");
        championMap.put(30L, "Karthus");
        championMap.put(31L, "Chogath");
        championMap.put(32L, "Amumu");
        championMap.put(33L, "Rammus");
        championMap.put(34L, "Anivia");
        championMap.put(35L, "Shaco");
        championMap.put(36L, "DrMundo");
        championMap.put(37L, "Sona");
        championMap.put(38L, "Kassadin");
        championMap.put(39L, "Irelia");
        championMap.put(40L, "Janna");
        championMap.put(41L, "Gangplank");
        championMap.put(42L, "Corki");
        championMap.put(43L, "Karma");
        championMap.put(44L, "Taric");
        championMap.put(45L, "Veigar");
        championMap.put(48L, "Trundle");
        championMap.put(50L, "Swain");
        championMap.put(51L, "Caitlyn");
        championMap.put(53L, "Blitzcrank");
        championMap.put(54L, "Malphite");
        championMap.put(55L, "Katarina");
        championMap.put(56L, "Nocturne");
        championMap.put(57L, "Maokai");
        championMap.put(58L, "Renekton");
        championMap.put(59L, "JarvanIV");
        championMap.put(60L, "Elise");
        championMap.put(61L, "Orianna");
        championMap.put(62L, "MonkeyKing");
        championMap.put(63L, "Brand");
        championMap.put(64L, "LeeSin");
        championMap.put(67L, "Vayne");
        championMap.put(68L, "Rumble");
        championMap.put(69L, "Cassiopeia");
        championMap.put(74L, "Heimerdinger");
        championMap.put(75L, "Nasus");
        championMap.put(76L, "Nidalee");
        championMap.put(77L, "Udyr");
        championMap.put(78L, "Poppy");
        championMap.put(79L, "Gragas");
        championMap.put(80L, "Pantheon");
        championMap.put(81L, "Ezreal");
        championMap.put(82L, "Mordekaiser");
        championMap.put(83L, "Yorick");
        championMap.put(84L, "Akali");
        championMap.put(85L, "Kennen");
        championMap.put(86L, "Garen");
        championMap.put(89L, "Leona");
        championMap.put(90L, "Malzahar");
        championMap.put(91L, "Talon");
        championMap.put(92L, "Riven");
        championMap.put(96L, "KogMaw");
        championMap.put(98L, "Shen");
        championMap.put(99L, "Lux");
        championMap.put(101L, "Xerath");
        championMap.put(102L, "Shyvana");
        championMap.put(103L, "Ahri");
        championMap.put(104L, "Graves");
        championMap.put(105L, "Fizz");
        championMap.put(106L, "Volibear");
        championMap.put(107L, "Rengar");
        championMap.put(110L, "Varus");
        championMap.put(111L, "Nautilus");
        championMap.put(112L, "Viktor");
        championMap.put(113L, "Sejuani");
        championMap.put(114L, "Fiora");
        championMap.put(115L, "Ziggs");
        championMap.put(117L, "Lulu");
        championMap.put(119L, "Draven");
        championMap.put(120L, "Hecarim");
        championMap.put(121L, "Khazix");
        championMap.put(122L, "Darius");
        championMap.put(126L, "Jayce");
        championMap.put(127L, "Lissandra");
        championMap.put(131L, "Diana");
        championMap.put(133L, "Quinn");
        championMap.put(134L, "Syndra");
        championMap.put(136L, "AurelionSol");
        championMap.put(141L, "Kayn");
        championMap.put(142L, "Zoe");
        championMap.put(143L, "Zyra");
        championMap.put(145L, "Kaisa");
        championMap.put(147L, "Seraphine");
        championMap.put(150L, "Gnar");
        championMap.put(154L, "Zac");
        championMap.put(157L, "Yasuo");
        championMap.put(161L, "Velkoz");
        championMap.put(163L, "Taliyah");
        championMap.put(164L, "Camille");
        championMap.put(166L, "Akshan");
        championMap.put(200L, "Belveth");
        championMap.put(201L, "Braum");
        championMap.put(202L, "Jhin");
        championMap.put(203L, "Kindred");
        championMap.put(221L, "Zeri");
        championMap.put(222L, "Jinx");
        championMap.put(223L, "TahmKench");
        championMap.put(234L, "Viego");
        championMap.put(235L, "Senna");
        championMap.put(236L, "Lucian");
        championMap.put(238L, "Zed");
        championMap.put(240L, "Kled");
        championMap.put(245L, "Ekko");
        championMap.put(246L, "Qiyana");
        championMap.put(254L, "Vi");
        championMap.put(266L, "Aatrox");
        championMap.put(267L, "Nami");
        championMap.put(268L, "Azir");
        championMap.put(350L, "Yuumi");
        championMap.put(360L, "Samira");
        championMap.put(412L, "Thresh");
        championMap.put(420L, "Illaoi");
        championMap.put(421L, "RekSai");
        championMap.put(427L, "Ivern");
        championMap.put(429L, "Kalista");
        championMap.put(432L, "Bard");
        championMap.put(497L, "Rakan");
        championMap.put(498L, "Xayah");
        championMap.put(516L, "Ornn");
        championMap.put(517L, "Sylas");
        championMap.put(518L, "Neeko");
        championMap.put(523L, "Aphelios");
        championMap.put(526L, "Rell");
        championMap.put(555L, "Pyke");
        championMap.put(875L, "Sett");
        championMap.put(876L, "Yone");
        championMap.put(887L, "Gwen");
        championMap.put(888L, "Renata");
        championMap.put(895L, "Karthus"); // 올바른 매핑 확인 필요
        
        return championMap.getOrDefault(championId, "Unknown");
    }
    
    // ==========================================
    // 함께 플레이한 소환사 조회
    // ==========================================
    
    /** 게임명+태그로 함께 플레이한 소환사 상위 5명 조회 */
    public Mono<List<PlayedWithDto>> getPlayedWithByGameNameAndTagLine(String gameName, String tagLine) {
        return getAccountDtoByGameNameAndTagLine(gameName, tagLine)
                .flatMap(acc -> {
                    String puuid = acc.getPuuid();
                    // 최근 20개 매치 조회
                    return matchService.getMatchSummaryDtosByMatchIds(gameName, tagLine, 20)
                            .map(matches -> {
                                // 같은 팀 참가자들을 추출하여 집계
                                Map<String, PlayedWithStats> statsMap = new HashMap<>();
                                
                                for (MatchSummaryDto match : matches) {
                                    if (match.getInfo() == null || match.getInfo().getParticipants() == null) {
                                        continue;
                                    }
                                    
                                    // 현재 소환사 찾기
                                    String currentTeamId = null;
                                    for (var p : match.getInfo().getParticipants()) {
                                        if (puuid.equals(p.getPuuid())) {
                                            currentTeamId = String.valueOf(p.getTeamId());
                                            break;
                                        }
                                    }
                                    
                                    if (currentTeamId == null) continue;
                                    
                                    // 같은 팀 참가자들 추출
                                    for (var p : match.getInfo().getParticipants()) {
                                        if (puuid.equals(p.getPuuid())) continue; // 본인 제외
                                        if (!String.valueOf(p.getTeamId()).equals(currentTeamId)) continue; // 다른 팀 제외
                                        
                                        String participantPuuid = p.getPuuid();
                                        String name = p.getRiotIdGameName() != null ? p.getRiotIdGameName() : p.getSummonerName();
                                        
                                        PlayedWithStats stats = statsMap.computeIfAbsent(participantPuuid, 
                                                k -> new PlayedWithStats(name, p.getPuuid()));
                                        
                                        stats.games++;
                                        if (p.isWin()) {
                                            stats.wins++;
                                        } else {
                                            stats.losses++;
                                        }
                                    }
                                }
                                
                                // 통계를 DTO로 변환하고 게임 수 기준 정렬 후 상위 5개
                                return statsMap.values().stream()
                                        .sorted((a, b) -> Integer.compare(b.games, a.games))
                                        .limit(5)
                                        .map(stats -> {
                                            PlayedWithDto dto = new PlayedWithDto();
                                            // 이름과 태그 분리 (Riot ID 형식)
                                            String[] nameParts = stats.name.split("#");
                                            dto.setName(nameParts[0]);
                                            dto.setTag(nameParts.length > 1 ? nameParts[1] : "KR1");
                                            dto.setLevel(100); // 기본값, 실제로는 AccountDto 조회 필요
                                            dto.setIconUrl(""); // 프로필 아이콘 URL (프론트엔드에서 처리)
                                            dto.setGames(stats.wins + "승 / " + stats.losses + "패");
                                            int totalGames = stats.wins + stats.losses;
                                            dto.setWinrate(totalGames > 0 ? (stats.wins * 100 / totalGames) : 0);
                                            dto.setWins(stats.wins);
                                            dto.setLosses(stats.losses);
                                            return dto;
                                        })
                                        .collect(Collectors.toList());
                            })
                            .defaultIfEmpty(Collections.emptyList());
                })
                .defaultIfEmpty(Collections.emptyList());
    }
    
    /** 함께 플레이한 소환사 통계를 저장하는 내부 클래스 */
    private static class PlayedWithStats {
        String name;
        String puuid;
        int games = 0;
        int wins = 0;
        int losses = 0;
        
        PlayedWithStats(String name, String puuid) {
            this.name = name;
            this.puuid = puuid;
        }
    }
}
