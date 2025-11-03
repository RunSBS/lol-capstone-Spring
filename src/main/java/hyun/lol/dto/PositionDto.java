package hyun.lol.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 포지션 정보 DTO
 * - 최근 게임에서 플레이한 포지션 통계
 */
@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class PositionDto {
    private String role;        // 포지션 이름 (TOP, JNG, MID, ADC, SUP)
    private int percentage;     // 플레이 비율 (0~100)
    private String icon;        // 포지션 아이콘 URL
}

