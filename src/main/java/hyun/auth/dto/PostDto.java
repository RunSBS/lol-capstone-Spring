package hyun.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class PostDto {
    private Long id;
    private Long userId;
    private String writer; // 작성자 이름 (프론트엔드와 매칭)
    private String title;
    private String content;
    private String category;
    private Instant createdAt;
    private Instant updatedAt;
    private int like = 0; // 추천 수
    private int dislike = 0; // 반대 수
}

