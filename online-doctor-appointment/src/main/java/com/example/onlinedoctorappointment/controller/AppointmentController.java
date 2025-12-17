package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.Appointment;
import com.example.onlinedoctorappointment.entity.AppointmentStatus;
import com.example.onlinedoctorappointment.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PostMapping
    public Appointment createAppointment(
            @RequestBody CreateAppointmentRequest req) {

        // Assemble entity inside controller
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
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    /**
     * Cancel appointment (User)
     * PUT /api/appointments/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Long id) {
        return appointmentService.cancelAppointment(id);
    }

    /**
     * Approve appointment (Doctor / Admin)
     * PUT /api/appointments/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public Appointment approveAppointment(@PathVariable Long id) {
        return appointmentService.approveAppointment(id);
    }

    /**
     * 2.6 Reschedule appointment
     * PUT /api/appointments/{id}/reschedule?newTimeSlotId=xx
     */
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
    @GetMapping("/status/{status}")
    public List<Appointment> getByStatus(
            @PathVariable AppointmentStatus status) {

        return appointmentService.getAppointmentsByStatus(status);
    }
    @GetMapping("/upcoming")
    public List<Appointment> getUpcomingAppointments() {
        return appointmentService.getAppointmentsByStatusList(
                List.of(
                        AppointmentStatus.PENDING,
                        AppointmentStatus.APPROVED
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(
            @PathVariable Long patientId) {

        return appointmentService.getAppointmentsByPatient(patientId);
    }

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
