package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// PostReaction.java - 게시글 반응 요약 테이블
@Entity
@Table(name = "POST_REACTION")
@Getter
@Setter
public class PostReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_reaction_seq")
    @SequenceGenerator(name = "post_reaction_seq", sequenceName = "POST_REACTION_SEQ", allocationSize = 1)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false, unique = true)
    private Post post;

    @Column(nullable = false)
    private Long likes = 0L; // 좋아요 총합

    @Column(nullable = false)
    private Long dislikes = 0L; // 싫어요 총합
}
