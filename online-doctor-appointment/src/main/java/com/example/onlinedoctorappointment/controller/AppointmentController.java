package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.Appointment;
import com.example.onlinedoctorappointment.entity.AppointmentStatus;
import com.example.onlinedoctorappointment.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
        name = "Appointment Management",
        description = "APIs for creating, managing, and tracking appointment lifecycle"
)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * ================================
     * Internal DTO for create request
     * ================================
     * Only used to receive POST JSON
     */
    static class CreateAppointmentRequest {
        public Long patientId;
        public Long timeSlotId;
        public String note;
    }

    /**
     * Create appointment
     * POST /api/appointments
     */
    @Operation(
            summary = "Create a new appointment",
            description = "Patient creates an appointment by selecting an available doctor time slot and optionally providing notes"
    )
    @PostMapping
    public Appointment createAppointment(
            @RequestBody CreateAppointmentRequest req) {

        Appointment appointment = new Appointment();
        appointment.setPatientId(req.patientId);
        appointment.setTimeSlotId(req.timeSlotId);
        appointment.setNote(req.note);

        return appointmentService.createAppointment(appointment);
    }

    /**
     * Get all appointments
     * GET /api/appointments
     */
    @Operation(
            summary = "Get all appointments",
            description = "Retrieve all appointments in the system"
    )
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    /**
     * Cancel appointment (User)
     * PUT /api/appointments/{id}/cancel
     */
    @Operation(
            summary = "Cancel an appointment",
            description = "Patient cancels a pending or approved appointment"
    )
    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Long id) {
        return appointmentService.cancelAppointment(id);
    }

    /**
     * Approve appointment (Doctor / Admin)
     * PUT /api/appointments/{id}/approve
     */
    @Operation(
            summary = "Approve an appointment",
            description = "Doctor or administrator approves a pending appointment"
    )
    @PutMapping("/{id}/approve")
    public Appointment approveAppointment(@PathVariable Long id) {
        return appointmentService.approveAppointment(id);
    }

    /**
     * Reschedule appointment
     * PUT /api/appointments/{id}/reschedule?newTimeSlotId=xx
     */
    @Operation(
            summary = "Reschedule an appointment",
            description = "Patient reschedules an existing appointment by selecting a new available time slot"
    )
    @PutMapping("/{id}/reschedule")
    public Appointment rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam Long newTimeSlotId) {

        return appointmentService.rescheduleAppointment(id, newTimeSlotId);
    }

    /**
     * Get appointments by status
     * GET /api/appointments/status/{status}
     */
    @Operation(
            summary = "Get appointments by status",
            description = "Retrieve appointments filtered by appointment status"
    )
    @GetMapping("/status/{status}")
    public List<Appointment> getByStatus(
            @PathVariable AppointmentStatus status) {

        return appointmentService.getAppointmentsByStatus(status);
    }

    /**
     * Get upcoming appointments
     */
    @Operation(
            summary = "Get upcoming appointments",
            description = "Retrieve all upcoming appointments with status PENDING or APPROVED"
    )
    @GetMapping("/upcoming")
    public List<Appointment> getUpcomingAppointments() {
        return appointmentService.getAppointmentsByStatusList(
                List.of(
                        AppointmentStatus.PENDING,
                        AppointmentStatus.APPROVED
                )
        );
    }

    /**
     * Get appointments by patient
     */
    @Operation(
            summary = "Get appointments by patient",
            description = "Retrieve all appointments for a specific patient"
    )
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(
            @PathVariable Long patientId) {

        return appointmentService.getAppointmentsByPatient(patientId);
    }

    /**
     * Get appointment history
     */
    @Operation(
            summary = "Get appointment history",
            description = "Retrieve historical appointments with status CANCELLED or REJECTED"
    )
    @GetMapping("/history")
    public List<Appointment> getHistoryAppointments() {
        return appointmentService.getAppointmentsByStatusList(
                List.of(
                        AppointmentStatus.CANCELLED,
                        AppointmentStatus.REJECTED
                )
        );
    }
}
