package hyun.auth.security;

import hyun.auth.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight 요청 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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
                        // 게시글 조회는 인증 없이 가능
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                        // 댓글 조회는 인증 없이 가능
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        // 토큰 순위 조회는 인증 없이 가능 (구체적인 경로를 먼저 배치)
                        .requestMatchers("/api/user/ranking").permitAll()
                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )
                // JWT 필터 추가
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // 브라우저 기본 인증창 뜨지 않게 둘 다 끔
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
}

