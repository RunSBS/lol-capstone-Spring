package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 내기 정산 기록 테이블 (BET_SETTLEMENTS)
 * - 마감된 내기의 정산 결과 저장
 */
@Entity
@Table(name = "BET_SETTLEMENTS")
@Getter
@Setter
public class BetSettlement {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bet_settlement_seq")
    @SequenceGenerator(name = "bet_settlement_seq", sequenceName = "BET_SETTLEMENTS_SEQ", allocationSize = 1)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BET_ID", nullable = false, unique = true)
    private Bet bet;                      // 정산된 내기

    @Column(name = "WINNER_OPTION", nullable = false, length = 1)
    private String winnerOption;          // 'A' or 'B'

    @Column(name = "SETTLED_AT")
    private Instant settledAt = Instant.now();  // 정산 완료 시각
}
