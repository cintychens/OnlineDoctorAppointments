package com.example.onlinedoctorappointment.repository;

import com.example.onlinedoctorappointment.entity.Appointment;
import com.example.onlinedoctorappointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByStatusIn(List<AppointmentStatus> statuses);
}
