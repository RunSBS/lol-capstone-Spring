package hyun.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

/**
 * 댓글 DTO
 */
@Getter
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private Long postId;
    private Long userId;
    private String writer;     // 작성자 이름
    private String content;   // 댓글 내용
    private Long likes;        // 좋아요 수
    private Long dislikes;    // 싫어요 수
    private Instant createdAt; // 작성 시간
}

