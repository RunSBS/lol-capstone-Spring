# Riot API 공식 필드명 매핑 문서

## Match-v5 API 공식 필드명

### 1. Info Level
```json
{
  "gameCreation": 1234567890,
  "gameDuration": 1234,
  "gameStartTimestamp": 1234567890,
  "gameEndTimestamp": 1234567890,
  "gameId": 1234567890,
  "gameMode": "CLASSIC",
  "gameName": "teambuilder-match-1234567890",
  "gameType": "MATCHED_GAME",
  "gameVersion": "13.24.542.1234",
  "mapId": 11,
  "participants": [],
  "platformId": "KR",
  "queueId": 420,
  "teams": [],
  "tournamentCode": ""
}
```

### 2. Participant Level
```json
{
  "puuid": "abc123...",
  "riotIdGameName": "Hide on bush",
  "riotIdTagline": "KR1",
  "summonerName": "",
  "summonerId": "abc123...",
  "summoner1Id": 4,
  "summoner2Id": 14,
  "championName": "LeeSin",
  "championId": 64,
  "champLevel": 13,
  "teamId": 100,
  "teamPosition": "JUNGLE",
  "role": "NONE",
  "lane": "JUNGLE",
  "participantId": 1,
  "kills": 5,
  "deaths": 3,
  "assists": 12,
  "largestKillingSpree": 3,
  "largestMultiKill": 2,
  "totalMinionsKilled": 120,
  "neutralMinionsKilled": 45,
  "goldEarned": 7540,
  "goldSpent": 7200,
  "totalDamageDealtToChampions": 18500,
  "totalDamageTaken": 8900,
  "visionScore": 45,
  "wardsPlaced": 12,
  "wardsKilled": 5,
  "item0": 6672,
  "item1": 3072,
  "item2": 3047,
  "item3": 3009,
  "item4": 2055,
  "item5": 0,
  "item6": 3364,
  "perks": {
    "statPerks": {...},
    "styles": [...]
  },
  "win": true
}
```

### 3. Perks 구조
```json
{
  "statPerks": {
    "defense": 5002,
    "flex": 5008,
    "offense": 5005
  },
  "styles": [
    {
      "description": "primaryStyle",
      "selections": [
        {
          "perk": 8112,
          "var1": 1234,
          "var2": 56,
          "var3": 0
        }
      ],
      "style": 8100
    },
    {
      "description": "subStyle",
      "selections": [...],
      "style": 8300
    }
  ]
}
```

## 현재 DTO와 비교

### ✅ 올바른 필드명 (Riot API 공식)
- `matchId`
- `gameCreation`
- `gameDuration`
- `gameMode`
- `gameVersion`
- `queueId`
- `puuid`
- `riotIdGameName`
- `riotIdTagline`
- `championName`
- `championId`
- `champLevel`
- `teamId`
- `kills`, `deaths`, `assists`
- `totalMinionsKilled`, `neutralMinionsKilled`
- `goldEarned`
- `summoner1Id`, `summoner2Id`
- `item0` ~ `item6`
- `totalDamageDealtToChampions`
- `totalDamageTaken`
- `visionScore`
- `wardsPlaced`
- `wardsKilled`
- `win`

### ⚠️ 커스텀/계산된 필드 (직접 생성)
- `csTotal` (totalMinionsKilled + neutralMinionsKilled 계산값)
- `kda` (계산값)
- `killParticipation` (계산값)
- `dpm` (계산값)
- `primaryStyleId`, `subStyleId`, `keystoneId` (perks에서 추출)
- `perkIds` (perks에서 추출)

### 📝 참고
- `summonerName`: 구버전 필드, 최신에서는 비어있음 (`riotIdGameName` 사용)
- `teamPosition`: 최신 필드 (TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY)
- `role`: 레거시 필드 (NONE/SOLO/DUO_CARRY 등)

