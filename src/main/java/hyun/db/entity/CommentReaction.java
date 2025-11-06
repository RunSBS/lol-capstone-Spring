package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 댓글 반응 기록 테이블 (COMMENT_REACTIONS)
 * - 사용자별 댓글 좋아요/싫어요 기록 (중복 투표 방지)
 */
@Entity
@Table(name = "COMMENT_REACTIONS", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"COMMENT_ID", "USER_ID"})
})
@Getter
@Setter
public class CommentReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_reaction_seq")
    @SequenceGenerator(name = "comment_reaction_seq", sequenceName = "COMMENT_REACTIONS_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMMENT_ID", nullable = false)
    private Comment comment;          // 반응한 댓글

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;                 // 반응한 사용자

    @Column(name = "REACTION_TYPE", nullable = false, length = 10)
    private String reactionType;       // "LIKE" or "DISLIKE"

    @Column(name = "CREATED_AT")
    private Instant createdAt = Instant.now();
}

