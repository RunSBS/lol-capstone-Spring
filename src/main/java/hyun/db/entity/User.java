package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// User.java
@Entity
@Table(name = "USERS")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name="PASSWORD_HASH", nullable = false, length = 200)
    private String passwordHash;

    @Column(nullable = false)
    private Long token = 0L; // 기본값 0, 포인트형 재화

    @Column(nullable = false, length = 20)
    private String role = "USER";
}
