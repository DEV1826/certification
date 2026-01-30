package cm.gov.pki.config;

import cm.gov.pki.service.AuthService;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
import java.util.Collections;

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
        
        // Autorise localhost pour le dev et ton domaine Render pour la prod
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:3000",
            "https://certification-6397.onrender.com" 
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
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
                // On autorise tout ce qui est sous /api/auth/ (register, login)
                .requestMatchers("/api/auth/**").permitAll()
                // Documentation et monitoring
                .requestMatchers("/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/actuator/**").permitAll()
                // Sécurisation de l'administration
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Tout le reste nécessite d'être connecté
                .anyRequest().authenticated()
            )
            
            // 6. Ajout du filtre JWT avant le filtre standard
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}