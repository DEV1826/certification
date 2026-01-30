package cm.gov.pki.config;

import cm.gov.pki.service.AuthService;
import cm.gov.pki.util.JwtAuthenticationFilter;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final AuthService authService;

    public SecurityConfig(AuthService authService) {
        this.authService = authService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public Filter jwtAuthenticationFilter() {
        return new cm.gov.pki.util.JwtAuthenticationFilter(authService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // TEMPORAIRE : Autorise toutes les origines pour débloquer le CORS (à restreindre ensuite)
        configuration.setAllowedOriginPatterns(java.util.Collections.singletonList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Autoriser tous les headers nécessaires pour les requêtes préflight
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Désactivation CSRF (nécessaire pour les APIs REST avec JWT)
            .csrf(csrf -> csrf.disable())

            // 2. Application de la config CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Gestion de session Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Gestion des erreurs d'authentification
            .exceptionHandling(exc -> exc
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Non autorisé - Token manquant ou invalide\"}");
                })
            )

            // 5. Règles d'autorisation
            .authorizeHttpRequests(authorize -> authorize
                // Autoriser les requêtes préflight OPTIONS pour toutes les routes
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // On autorise tout ce qui est sous /auth/ ou /api/auth/ (register, login)
                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                // Documentation et monitoring
                .requestMatchers("/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/actuator/**").permitAll()
                // Sécurisation de l'administration (chemins avec et sans /api)
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")
                // Tout le reste nécessite d'être connecté
                .anyRequest().authenticated()
            )

            // 6. Ajout du filtre JWT avant le filtre standard
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
