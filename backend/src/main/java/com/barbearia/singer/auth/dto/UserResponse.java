package com.barbearia.singer.auth.dto;

import com.barbearia.singer.user.Role;
import com.barbearia.singer.user.Usuario;

public class UserResponse {

    private Long id;
    private String nome;
    private String email;
    private Role role;

    public UserResponse() {
    }

    public UserResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.role = usuario.getRole();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
