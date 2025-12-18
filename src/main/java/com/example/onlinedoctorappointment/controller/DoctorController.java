package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.Doctor;
import com.example.onlinedoctorappointment.service.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
        name = "Doctor Management",
        description = "APIs for managing doctor profiles, specialties, and availability"
)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    /**
     * Admin: create doctor
     */
    @Operation(
            summary = "Create a new doctor",
            description = "Administrator creates a new doctor profile with specialty information"
    )
    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    /**
     * User: view all available doctors
     */
    @Operation(
            summary = "Get all available doctors",
            description = "Retrieve a list of all enabled doctors available for appointment"
    )
    @GetMapping
    public List<Doctor> getAvailableDoctors() {
        return doctorService.getAvailableDoctors();
    }

    /**
     * User: filter doctors by specialty
     */
    @Operation(
            summary = "Get doctors by specialty",
            description = "Retrieve doctors filtered by medical specialty"
    )
    @GetMapping("/specialty/{specialty}")
    public List<Doctor> getDoctorsBySpecialty(@PathVariable String specialty) {
        return doctorService.getDoctorsBySpecialty(specialty);
    }

    /**
     * Admin: update doctor
     */
    @Operation(
            summary = "Update doctor information",
            description = "Administrator updates doctor profile information"
    )
    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Long id,
                               @RequestBody Doctor doctor) {
        return doctorService.updateDoctor(id, doctor);
    }

    /**
     * Admin: disable doctor
     */
    @Operation(
            summary = "Disable doctor account",
            description = "Administrator disables a doctor so that they are no longer available for booking"
    )
    @PutMapping("/{id}/disable")
    public Doctor disableDoctor(@PathVariable Long id) {
        return doctorService.disableDoctor(id);
    }

    /**
     * Admin: delete doctor
     */
    @Operation(
            summary = "Delete doctor",
            description = "Administrator permanently deletes a doctor profile"
    )
    @DeleteMapping("/{id}")
    public void deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
    }
}
