package hyun.lol.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AutocompleteDto {
    private int id;
    private String name;
    private String tag;
    private Integer level;
    private Integer profileIconId;
    private String tier;
    private String rank;
    private Integer lp;
    private String ddVer;
}

