package com.example.onlinedoctorappointment.controller;

import com.example.onlinedoctorappointment.entity.TimeSlot;
import com.example.onlinedoctorappointment.service.TimeSlotService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
        name = "Time Slot Management",
        description = "APIs for managing doctor consultation time slots and availability"
)
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
    @Operation(
            summary = "Get available time slots by doctor",
            description = "Retrieve all available consultation time slots for a specific doctor"
    )
    @GetMapping("/doctor/{doctorId}/available")
    public List<TimeSlot> getAvailableSlotsByDoctor(
            @PathVariable Long doctorId) {

        return timeSlotService.getAvailableSlotsByDoctor(doctorId);
    }

    /**
     * Create a new time slot
     * POST /api/timeslots
     */
    @Operation(
            summary = "Create a new time slot",
            description = "Doctor or administrator creates a new consultation time slot"
    )
    @PostMapping
    public TimeSlot createTimeSlot(@RequestBody TimeSlot timeSlot) {
        return timeSlotService.createTimeSlot(timeSlot);
    }

    /**
     * Get all time slots
     * GET /api/timeslots
     */
    @Operation(
            summary = "Get all time slots",
            description = "Retrieve all consultation time slots in the system"
    )
    @GetMapping
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotService.getAllTimeSlots();
    }

    /**
     * Filter available time slots after a given time
     * GET /api/timeslots/available?after=2025-12-20T00:00:00
     */
    @Operation(
            summary = "Filter available time slots by time",
            description = "Retrieve available consultation time slots after a specified date and time"
    )
    @GetMapping("/available")
    public List<TimeSlot> getAvailableSlotsAfter(
            @RequestParam String after) {

        LocalDateTime time = LocalDateTime.parse(after);
        return timeSlotService.getAvailableSlotsAfter(time);
    }
}
