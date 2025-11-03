package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 내기 투표 기록 테이블 (BET_VOTES)
 * - 사용자의 투표 기록 저장
 */
@Entity
@Table(name = "BET_VOTES")
@Getter
@Setter
public class BetVote {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bet_vote_seq")
    @SequenceGenerator(name = "bet_vote_seq", sequenceName = "BET_VOTES_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BET_ID", nullable = false)
    private Bet bet;                      // 투표가 속한 내기

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;                    // 투표한 사용자

    @Column(name = "SELECTED_OPTION", nullable = false, length = 1)
    private String selectedOption;        // 'A' or 'B'

    @Column(name = "CREATED_AT")
    private Instant createdAt = Instant.now();
}
