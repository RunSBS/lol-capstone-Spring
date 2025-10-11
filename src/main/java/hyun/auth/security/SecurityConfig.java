package hyun.auth.security;

import hyun.auth.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 비회원 허용 (전적조회, 헬스체크 등)
                        .requestMatchers(
                                "/summoner/**",
                                "/match/**",
                                "/actuator/**",
                                "/error",
                                "/dd/**",
                                "/img/**",
                                "/static/**",
                                "/favicon.ico"
                        ).permitAll()
                        // 회원가입/로그인 API도 공개
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )
                // 브라우저 기본 인증창 뜨지 않게 둘 다 끔
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
}

