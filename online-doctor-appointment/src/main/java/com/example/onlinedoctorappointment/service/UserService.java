package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.User;
import com.example.onlinedoctorappointment.entity.UserRole;
import com.example.onlinedoctorappointment.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Register */
    public User register(String username, String password, UserRole role) {
        userRepository.findByUsername(username).ifPresent(u -> {
            throw new RuntimeException("Username already exists");
        });

        User user = new User(username, password, role);
        return userRepository.save(user);
    }

    /** Login */
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
