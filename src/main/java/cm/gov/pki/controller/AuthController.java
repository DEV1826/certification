package cm.gov.pki.controller;

import cm.gov.pki.dto.AuthDTO;
import cm.gov.pki.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthDTO.UserDTO> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
		AuthDTO.UserDTO user = authService.register(request);
		return ResponseEntity.ok(user);
	}

	@PostMapping("/login")
	public ResponseEntity<AuthDTO.JwtResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
		AuthDTO.JwtResponse jwt = authService.login(request);
		return ResponseEntity.ok(jwt);
	}
}
