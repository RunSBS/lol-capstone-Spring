package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "POSTS")
@Getter
@Setter
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "POSTS_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User user; // 글 작성자

    @Column(name = "USER_ID", nullable = false)
    private Long userId; // USER_ID 컬럼 (AUTHOR_ID와 동일한 값)

    @Column(nullable = false, length = 200)
    private String title;

    @Lob 
    @Column(nullable = false)
    private String content;

    @Column(length = 50)
    private String category; // 카테고리 (free, guide, lolmuncheol)

    @Column(name = "CREATED_AT")
    private Instant createdAt;

    @Column(name = "UPDATED_AT")
    private Instant updatedAt;
}
