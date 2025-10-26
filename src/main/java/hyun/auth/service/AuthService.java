package hyun.auth.service;

import hyun.db.entity.User;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Transactional
    public void register(String username, String email, String rawPassword) {
        if (users.existsByUsername(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "아이디 중복");
        if (users.existsByEmail(email))     throw new ResponseStatusException(HttpStatus.CONFLICT, "이메일 중복");
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(encoder.encode(rawPassword));
        u.setToken(" "); // Oracle은 빈 문자열("")을 NULL로 취급하므로 공백 문자 사용
        u.setPasswordField(" "); // Oracle은 빈 문자열("")을 NULL로 취급하므로 공백 문자 사용
        u.setTokenBalance(0L);
        u.setRole("USER");
        u.setCreatedAt(Instant.now());
        
        users.save(u);
    }

    public User load(String username) {
        return users.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "계정 없음"));
    }
}