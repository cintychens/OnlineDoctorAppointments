package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.Doctor;
import com.example.onlinedoctorappointment.service.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    /** Admin: create doctor */
    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    /** User: view all available doctors */
    @GetMapping
    public List<Doctor> getAvailableDoctors() {
        return doctorService.getAvailableDoctors();
    }

    /** User: filter by specialty */
    @GetMapping("/specialty/{specialty}")
    public List<Doctor> getDoctorsBySpecialty(@PathVariable String specialty) {
        return doctorService.getDoctorsBySpecialty(specialty);
    }

    /** Admin: update doctor */
    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Long id,
                               @RequestBody Doctor doctor) {
        return doctorService.updateDoctor(id, doctor);
    }

    /** Admin: disable doctor */
    @PutMapping("/{id}/disable")
    public Doctor disableDoctor(@PathVariable Long id) {
        return doctorService.disableDoctor(id);
    }

    /** Admin: delete doctor */
    @DeleteMapping("/{id}")
    public void deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
    }
}
