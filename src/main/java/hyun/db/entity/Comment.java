package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 댓글 테이블 (COMMENTS)
 * - 게시글에 달린 댓글 정보 저장
 */
@Entity
@Table(name = "COMMENTS")
@Getter
@Setter
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_seq")
    @SequenceGenerator(name = "comment_seq", sequenceName = "COMMENTS_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;              // 댓글이 달린 게시글

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User user;               // 댓글 작성자

    @Column(name = "CONTENT", nullable = false)
    private String content;          // 댓글 내용

    @Column(name = "LIKES", nullable = false)
    private Long likes = 0L;         // 좋아요 수

    @Column(name = "DISLIKES", nullable = false)
    private Long dislikes = 0L;     // 싫어요 수

    @Column(name = "CREATED_AT")
    private Instant createdAt = Instant.now();

    @Column(name = "IS_DELETED", nullable = false)
    private Boolean isDeleted = false;  // 댓글 삭제 여부
}
