package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 게시글 테이블 (POSTS)
 * - 커뮤니티 게시글 정보 저장
 */
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
    private User user;           // 글 작성자

    @Column(name = "USER_ID", nullable = false)
    private Long userId;         // USER_ID 컬럼 (AUTHOR_ID와 동일한 값)

    @Column(nullable = false, length = 200)
    private String title;        // 제목

    @Lob 
    @Column(nullable = false)
    private String content;      // 내용
    @Lob
    @Column(name = "MATCH_DATA")
    private String matchData;     // 전적 데이터 (JSON 형식, 롤문철 카테고리용)

    @Lob
    @Column(name = "CONTENT_B")
    private String contentB;      // 작성자B 본문 (롤문철 카테고리용)

    @Column(length = 100, name = "WRITER_B")
    private String writerB;       // 작성자B 닉네임 (롤문철 카테고리용)

    @Column(length = 50)
    private String category;     // 카테고리 (free, guide, lolmuncheol)

    @Column(name = "CREATED_AT")
    private Instant createdAt;   // 작성 시간

    @Column(name = "UPDATED_AT")
    private Instant updatedAt;   // 수정 시간
}
