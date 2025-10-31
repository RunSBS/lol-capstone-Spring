package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 토큰 거래 이력 테이블 (TOKEN_TRANSACTIONS)
 * - 토큰 증감 이력 추적
 */
@Entity
@Table(name = "TOKEN_TRANSACTIONS")
@Getter
@Setter
public class TokenTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "token_transaction_seq")
    @SequenceGenerator(name = "token_transaction_seq", sequenceName = "TOKEN_TRANSACTIONS_SEQ", allocationSize = 1)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Long amount;          // 증감량 (+50, -100 등)
    
    @Column(name = "BALANCE_BEFORE", nullable = false)
    private Long balanceBefore;   // 거래 전 잔액
    
    @Column(name = "BALANCE_AFTER", nullable = false)
    private Long balanceAfter;    // 거래 후 잔액
    
    @Column(name = "TRANSACTION_TYPE", length = 50)
    private String transactionType; // "ATTENDANCE", "BET_REWARD", "PURCHASE"
    
    @Column(length = 200)
    private String description;    // "투표 승리 보상", "아리 스티커 구매" 등
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt = LocalDateTime.now();
}

