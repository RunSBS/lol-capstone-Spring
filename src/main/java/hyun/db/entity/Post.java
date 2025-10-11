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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob @Column(nullable = false)
    private String content;

    private Instant createdAt = Instant.now();
    private Instant updatedAt;
}
