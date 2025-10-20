package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "COMMENTS")
@Getter
@Setter
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Oracle 12c 이상에서 지원
    private Long id;

    // 게시글: 댓글은 특정 게시글에 속함 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;

    // 작성자: 댓글 작성자 정보 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User author;

    // 부모 댓글 (대댓글 지원용, 최상위 댓글이면 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_ID")
    private Comment parent;

    // 댓글 내용
    @Lob
    @Column(nullable = false)
    private String content;

    // 삭제 여부 (소프트 삭제용)
    @Column(nullable = false, length = 1)
    private String isDeleted = "N"; // 'Y' or 'N'

    // 좋아요 수
    @Column(nullable = false)
    private Long likeCount = 0L;

    // 생성 / 수정 시각
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt;
}
