package com.barbearia.singer.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barbearia.singer.auth.dto.AuthResponse;
import com.barbearia.singer.auth.dto.LoginRequest;
import com.barbearia.singer.auth.dto.RegisterRequest;
import com.barbearia.singer.auth.dto.UserResponse;
import com.barbearia.singer.security.JwtService;
import com.barbearia.singer.security.UsuarioPrincipal;
import com.barbearia.singer.user.Role;
import com.barbearia.singer.user.StatusCliente;
import com.barbearia.singer.user.Usuario;
import com.barbearia.singer.user.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setDataNascimento(request.getDataNascimento());
        usuario.setRole(Role.CLIENTE);
        usuario.setStatus(StatusCliente.ATIVO);

        return new UserResponse(usuarioRepository.save(usuario));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getSenha()));

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        String token = jwtService.generateToken(usuario);
        return new AuthResponse(token, usuario.getNome(), usuario.getEmail(), usuario.getRole());
    }

    public UserResponse me(UsuarioPrincipal principal) {
        return new UserResponse(principal.getUsuario());
    }
}
