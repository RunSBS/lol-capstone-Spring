package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * 회원 테이블 (USERS)
 * - 로그인, JWT 토큰 관리, 토큰 잔액 관리
 */
@Entity
@Table(name = "USERS")
@Getter
@Setter
public class User {
    
    public User() {
        this.token = " "; // Oracle은 빈 문자열("")을 NULL로 취급하므로 공백 문자 사용
        this.passwordField = " "; // Oracle은 빈 문자열("")을 NULL로 취급하므로 공백 문자 사용
        this.tokenBalance = 0L;
        this.role = "USER";
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "USERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;     // 닉네임

    @Column(unique = true, nullable = false, length = 120)
    private String email;        // 로그인용 이메일

    @Column(name = "PASSWORD_HASH", nullable = false, length = 255)
    private String password;     // 암호화된 비밀번호 (BCrypt)

    @Column(name = "PASSWORD", nullable = false, length = 255)
    private String passwordField; // PASSWORD 컬럼 (사용 안 함)
    
    @Column(name = "TOKEN", nullable = false, length = 255)
    private String token;         // JWT 토큰
    
    @Column(name = "TOKEN_BALANCE", nullable = false)
    private Long tokenBalance;   // 현재 보유 토큰 잔액

    @Column(name = "ROLE", nullable = false, length = 50)
    private String role;         // 사용자 역할 (기본값: USER)

    @Column(name = "CREATED_AT")
    private Instant createdAt;   // 가입 일시
}
