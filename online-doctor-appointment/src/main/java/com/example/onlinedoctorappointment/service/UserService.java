package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.User;
import com.example.onlinedoctorappointment.entity.UserRole;
import com.example.onlinedoctorappointment.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Register user
     */
    public User register(String username, String password, UserRole role) {

        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username must not be empty"
            );
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must not be empty"
            );
        }

        if (role == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User role must be provided"
            );
        }

        userRepository.findByUsername(username).ifPresent(u -> {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        });

        User user = new User(username, password, role);
        return userRepository.save(user);
    }

    /**
     * Login
     */
    public User login(String username, String password) {

        if (username == null || password == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username and password are required"
            );
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username or password"
                ));

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        return user;
    }
}
