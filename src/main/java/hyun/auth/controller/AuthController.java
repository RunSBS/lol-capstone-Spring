package hyun.auth.controller;

import hyun.auth.jwt.JwtService;
import hyun.auth.service.AuthService;
import hyun.db.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public record RegisterReq(String username, String email, String password) {}
    public record LoginReq(String username, String password) {}

    @PostMapping("/register")
    public void register(@RequestBody RegisterReq req) {
        authService.register(req.username(), req.email(), req.password());
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginReq req) {
        User u = authService.load(req.username());
        if (!encoder.matches(req.password(), u.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "잘못된 자격증명");
        String access = jwt.createAccessToken(u.getId(), u.getUsername(), u.getRole());
        return Map.of("accessToken", access);
    }
}