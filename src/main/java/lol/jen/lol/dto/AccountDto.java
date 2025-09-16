package lol.jen.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
/**
 * Account-v1 API 호출 : gameName, tagLine 로 puuid 얻음
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountDto {
    // 소환사의 글로벌 고유 Id
    private String puuid;
    // 닉네임
    private String gameName;
    // 태그
    private String tagLine;
}
