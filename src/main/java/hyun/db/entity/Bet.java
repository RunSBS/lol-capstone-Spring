package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 내기 테이블 (BETS)
 * - 게시글에 연결된 투표형 내기 정보
 */
@Entity
@Table(name = "BETS")
@Getter
@Setter
public class Bet {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bet_seq")
    @SequenceGenerator(name = "bet_seq", sequenceName = "BETS_SEQ", allocationSize = 1)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false, unique = true)
    private Post post;             // 내기가 걸린 게시글

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BETTOR_ID", nullable = false)
    private User bettor;            // 내기를 건 사람

    @Column(name = "BET_TITLE", nullable = false, length = 200)
    private String betTitle;        // 내기 제목

    @Column(name = "OPTION_A", nullable = false, length = 100)
    private String optionA;        // 선택지 A

    @Column(name = "OPTION_B", nullable = false, length = 100)
    private String optionB;        // 선택지 B

    @Column(nullable = false)
    private Instant deadline;      // 투표 마감 시각

    @Column(name = "CREATED_AT")
    private Instant createdAt = Instant.now();
}
