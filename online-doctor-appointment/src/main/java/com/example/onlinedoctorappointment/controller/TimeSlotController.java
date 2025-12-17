package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.TimeSlot;
import com.example.onlinedoctorappointment.service.TimeSlotService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/timeslots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    /**
     * Get available time slots by doctor
     * GET /api/timeslots/doctor/{doctorId}/available
     */
    @GetMapping("/doctor/{doctorId}/available")
    public List<TimeSlot> getAvailableSlotsByDoctor(
            @PathVariable Long doctorId) {

        return timeSlotService.getAvailableSlotsByDoctor(doctorId);
    }

    /**
     * Create a new time slot
     * POST /api/timeslots
     */
    @PostMapping
    public TimeSlot createTimeSlot(@RequestBody TimeSlot timeSlot) {
        return timeSlotService.createTimeSlot(timeSlot);
    }

    /**
     * Get all time slots
     * GET /api/timeslots
     */
    @GetMapping
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotService.getAllTimeSlots();
    }

    /**
     * Filter available time slots after a given time
     * GET /api/timeslots/available?after=2025-12-20T00:00:00
     */
    @GetMapping("/available")
    public List<TimeSlot> getAvailableSlotsAfter(
            @RequestParam String after) {

        LocalDateTime time = LocalDateTime.parse(after);
        return timeSlotService.getAvailableSlotsAfter(time);
    }
}
