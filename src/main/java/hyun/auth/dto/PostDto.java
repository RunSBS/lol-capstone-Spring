package hyun.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

/**
 * 게시글 DTO
 */
@Getter
@AllArgsConstructor
public class PostDto {
    private Long id;
    private Long userId;
    private String writer;         // 작성자 이름
    private String title;          // 제목
    private String content;        // 내용
    private String category;       // 카테고리 (free, guide, lolmuncheol)
    private Instant createdAt;     // 작성 시간
    private Instant updatedAt;     // 수정 시간
    private int like;              // 추천 수
    private int dislike;           // 반대 수
}

