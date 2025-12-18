package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.User;
import com.example.onlinedoctorappointment.entity.UserRole;
import com.example.onlinedoctorappointment.service.UserService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** Register */
    @PostMapping("/register")
    public User register(@RequestParam String username,
                         @RequestParam String password,
                         @RequestParam UserRole role) {

        return userService.register(username, password, role);
    }

    /** Login */
    @PostMapping("/login")
    public User login(@RequestParam String username,
                      @RequestParam String password) {

        return userService.login(username, password);
    }
}
