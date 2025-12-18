package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.Doctor;
import com.example.onlinedoctorappointment.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    /**
     * Admin: create doctor
     */
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    /**
     * User: view available doctors
     */
    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByEnabledTrue();
    }

    /**
     * User: filter by specialty
     */
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyAndEnabledTrue(specialty);
    }

    /**
     * Admin: update doctor
     */
    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setName(updatedDoctor.getName());
        doctor.setSpecialty(updatedDoctor.getSpecialty());
        doctor.setDescription(updatedDoctor.getDescription());
        doctor.setEnabled(updatedDoctor.isEnabled());

        return doctorRepository.save(doctor);
    }

    /**
     * Admin: disable doctor
     */
    public Doctor disableDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setEnabled(false);
        return doctorRepository.save(doctor);
    }

    /**
     * Admin: delete doctor
     */

    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Doctor not found"
                        )
                );

        doctorRepository.delete(doctor);
    }
}
