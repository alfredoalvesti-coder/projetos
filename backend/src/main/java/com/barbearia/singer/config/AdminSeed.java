package com.barbearia.singer.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.barbearia.singer.user.Role;
import com.barbearia.singer.user.Usuario;
import com.barbearia.singer.user.UsuarioRepository;

@Component
@Order(1)
public class AdminSeed implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeed.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeed(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNome("Administrador");
        admin.setEmail("admin@barbeariasinger.com");
        admin.setSenha(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        usuarioRepository.save(admin);

        log.info("Admin criado: admin@barbeariaSinger.com / admin123");
    }
}
