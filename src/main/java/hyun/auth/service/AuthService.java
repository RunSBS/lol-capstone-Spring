package hyun.auth.service;

import hyun.db.entity.User;
import hyun.db.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
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
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole("USER");
        users.save(u);
    }

    public User load(String username) {
        return users.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "계정 없음"));
    }
}