package com.gymai.backend.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String email;

    public AuthResponse(String token, String email) {
        this.token = token;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public String getEmail() {
        return email;
    }
}
