package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.*;
import com.example.onlinedoctorappointment.repository.AppointmentRepository;
import com.example.onlinedoctorappointment.repository.TimeSlotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              TimeSlotRepository timeSlotRepository) {
        this.appointmentRepository = appointmentRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    /**
     * Create appointment with conflict detection
     */
    public Appointment createAppointment(Appointment appointment) {

        // 1. Validate request
        if (appointment.getTimeSlotId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "timeSlotId must not be null"
            );
        }

        if (appointment.getPatientId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "patientId must not be null"
            );
        }

        // 2. Find time slot
        TimeSlot slot = timeSlotRepository.findById(appointment.getTimeSlotId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Time slot not found"
                ));

        // 3. Conflict detection
        if (!slot.isAvailable()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Time slot already booked"
            );
        }

        // 4. Fill appointment information
        appointment.setDoctorId(slot.getDoctorId());
        appointment.setAppointmentTime(slot.getStartTime());
        appointment.setStatus(AppointmentStatus.PENDING);

        // 5. Save appointment
        Appointment saved = appointmentRepository.save(appointment);

        // 6. Lock time slot
        slot.setAvailable(false);
        timeSlotRepository.save(slot);

        return saved;
    }

    /**
     * Get appointments by doctor
     */
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }


    /**
     * Get all appointments
     */
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    /**
     * Approve appointment (Doctor / Admin)
     * Only PENDING → APPROVED
     */
    public Appointment approveAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING appointments can be approved"
            );
        }

        appointment.setStatus(AppointmentStatus.APPROVED);
        return appointmentRepository.save(appointment);
    }

    /**
     * Cancel appointment (User)
     * PENDING / APPROVED → CANCELLED
     * Release time slot
     */
    public Appointment cancelAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);

        if (appointment.getStatus() != AppointmentStatus.PENDING &&
                appointment.getStatus() != AppointmentStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING or APPROVED appointments can be cancelled"
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        TimeSlot slot = timeSlotRepository.findById(appointment.getTimeSlotId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Time slot not found"
                ));

        slot.setAvailable(true);
        timeSlotRepository.save(slot);

        return appointmentRepository.save(appointment);
    }

    /**
     * Reject appointment (Doctor / Admin)
     * Only PENDING → REJECTED
     */
    public Appointment rejectAppointment(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING appointments can be rejected"
            );
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        return appointmentRepository.save(appointment);
    }

    /**
     * 2.6 Reschedule appointment
     * PENDING / APPROVED → CANCELLED → new appointment
     */
    public Appointment rescheduleAppointment(Long appointmentId, Long newTimeSlotId) {

        Appointment oldAppointment = getAppointmentOrThrow(appointmentId);

        // 1. Only allow reschedule for PENDING or APPROVED
        if (oldAppointment.getStatus() != AppointmentStatus.PENDING &&
                oldAppointment.getStatus() != AppointmentStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING or APPROVED appointments can be rescheduled"
            );

        }

        // 2. Cancel old appointment (this releases old time slot)
        cancelAppointment(appointmentId);

        // 3. Create new appointment with new time slot
        Appointment newAppointment = new Appointment();
        newAppointment.setPatientId(oldAppointment.getPatientId());
        newAppointment.setTimeSlotId(newTimeSlotId);

        return createAppointment(newAppointment);
    }

    /**
     * Get appointments by status
     */
    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByStatusList(
            List<AppointmentStatus> statuses) {

        return appointmentRepository.findByStatusIn(statuses);
    }

    /**
     * Helper method
     */
    private Appointment getAppointmentOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Appointment not found"
                ));
    }
}
