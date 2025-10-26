package hyun.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private Long postId;
    private Long userId;
    private String writer; // 작성자 이름
    private String content;
    private Long likes;
    private Long dislikes;
    private Instant createdAt;
}

