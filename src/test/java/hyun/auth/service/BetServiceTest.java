package hyun.auth.service;

import hyun.db.entity.*;
import hyun.db.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BetService 테스트")
class BetServiceTest {

    @Mock
    private BetRepository betRepository;

    @Mock
    private BetVoteRepository betVoteRepository;

    @Mock
    private BetSettlementRepository betSettlementRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenTransactionRepository tokenTransactionRepository;

    @InjectMocks
    private BetService betService;

    private Bet testBet;
    private User user1;
    private User user2;
    private Long betId = 1L;
    private Long userId1 = 1L;
    private Long userId2 = 2L;

    @BeforeEach
    void setUp() {
        // 테스트용 내기 설정
        testBet = new Bet();
        testBet.setId(betId);
        testBet.setBetTitle("테스트 내기");
        testBet.setOptionA("옵션 A");
        testBet.setOptionB("옵션 B");
        testBet.setDeadline(Instant.now().plus(1, ChronoUnit.DAYS)); // 내일까지

        // 테스트용 사용자 설정
        user1 = new User();
        user1.setId(userId1);
        user1.setUsername("user1");
        user1.setTokenBalance(100L);

        user2 = new User();
        user2.setId(userId2);
        user2.setUsername("user2");
        user2.setTokenBalance(200L);
    }

    @Test
    @DisplayName("정상적인 투표 성공")
    void vote_Success() {
        // Given
        String option = "A";

        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(userRepository.findById(userId1)).thenReturn(Optional.of(user1));
        when(betVoteRepository.existsByBetAndUser(testBet, user1)).thenReturn(false);

        // When
        betService.vote(betId, userId1, option);

        // Then
        verify(betVoteRepository, times(1)).save(argThat(vote -> {
            BetVote v = (BetVote) vote;
            return v.getBet().getId().equals(betId) &&
                   v.getUser().getId().equals(userId1) &&
                   v.getSelectedOption().equals("A");
        }));
    }

    @Test
    @DisplayName("투표 실패 - 중복 투표")
    void vote_DuplicateVote() {
        // Given
        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(userRepository.findById(userId1)).thenReturn(Optional.of(user1));
        when(betVoteRepository.existsByBetAndUser(testBet, user1)).thenReturn(true);

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> betService.vote(betId, userId1, "A")
        );
        assertEquals(409, exception.getStatusCode().value());
        assertEquals("이미 투표하셨습니다.", exception.getReason());
        verify(betVoteRepository, never()).save(any());
    }

    @Test
    @DisplayName("투표 실패 - 마감된 투표")
    void vote_ExpiredBet() {
        // Given
        testBet.setDeadline(Instant.now().minus(1, ChronoUnit.DAYS)); // 어제 마감

        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        // 마감된 경우 user 조회 단계까지 가지 않으므로 stubbing 불필요

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> betService.vote(betId, userId1, "A")
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("투표가 마감되었습니다.", exception.getReason());
    }

    @Test
    @DisplayName("투표 실패 - 잘못된 옵션")
    void vote_InvalidOption() {
        // Given
        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(userRepository.findById(userId1)).thenReturn(Optional.of(user1));
        when(betVoteRepository.existsByBetAndUser(testBet, user1)).thenReturn(false);

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> betService.vote(betId, userId1, "C") // 잘못된 옵션
        );
        assertEquals(400, exception.getStatusCode().value());
        assertEquals("옵션은 'A' 또는 'B'여야 합니다.", exception.getReason());
    }

    @Test
    @DisplayName("정산 성공 - 승리자에게 토큰 지급")
    void settleBet_Success() {
        // Given
        String winnerOption = "A";

        // A 옵션에 투표한 사용자들
        BetVote vote1 = new BetVote();
        vote1.setUser(user1);
        vote1.setSelectedOption("A");

        BetVote vote2 = new BetVote();
        vote2.setUser(user2);
        vote2.setSelectedOption("A");

        List<BetVote> winningVotes = Arrays.asList(vote1, vote2);

        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(betSettlementRepository.findByBet(testBet)).thenReturn(Optional.empty());
        when(betVoteRepository.findByBetAndSelectedOption(testBet, winnerOption))
            .thenReturn(winningVotes);

        // When
        betService.settleBet(betId, winnerOption);

        // Then
        // 정산 기록 저장 확인
        verify(betSettlementRepository, times(1)).save(argThat(settlement -> {
            BetSettlement s = (BetSettlement) settlement;
            return s.getBet().getId().equals(betId) &&
                   s.getWinnerOption().equals("A");
        }));

        // 각 승리자에게 50토큰 지급 확인
        verify(userRepository, times(2)).save(any(User.class));
        assertEquals(150L, user1.getTokenBalance()); // 100 + 50
        assertEquals(250L, user2.getTokenBalance()); // 200 + 50

        // 토큰 거래 이력 2건 기록 확인
        verify(tokenTransactionRepository, times(2)).save(argThat(tx -> {
            TokenTransaction t = (TokenTransaction) tx;
            return t.getAmount().equals(50L) &&
                   t.getTransactionType().equals("BET_REWARD");
        }));
    }

    @Test
    @DisplayName("정산 실패 - 이미 정산된 내기")
    void settleBet_AlreadySettled() {
        // Given
        BetSettlement existingSettlement = new BetSettlement();
        existingSettlement.setBet(testBet);

        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(betSettlementRepository.findByBet(testBet))
            .thenReturn(Optional.of(existingSettlement));

        // When & Then
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> betService.settleBet(betId, "A")
        );
        assertEquals(409, exception.getStatusCode().value());
        assertEquals("이미 정산된 내기입니다.", exception.getReason());
    }

    @Test
    @DisplayName("정산 - 승리자 없음")
    void settleBet_NoWinners() {
        // Given
        when(betRepository.findById(betId)).thenReturn(Optional.of(testBet));
        when(betSettlementRepository.findByBet(testBet)).thenReturn(Optional.empty());
        when(betVoteRepository.findByBetAndSelectedOption(testBet, "A"))
            .thenReturn(List.of()); // 승리자 없음

        // When
        betService.settleBet(betId, "A");

        // Then
        verify(betSettlementRepository, times(1)).save(any());
        verify(userRepository, never()).save(any()); // 토큰 지급 없음
        verify(tokenTransactionRepository, never()).save(any());
    }
}

