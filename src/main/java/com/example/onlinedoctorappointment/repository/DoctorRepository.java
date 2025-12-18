package com.example.onlinedoctorappointment.repository;

import com.example.onlinedoctorappointment.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Find only enabled doctors (for users)
    List<Doctor> findByEnabledTrue();

    // Filter by specialty
    List<Doctor> findBySpecialtyAndEnabledTrue(String specialty);
}
