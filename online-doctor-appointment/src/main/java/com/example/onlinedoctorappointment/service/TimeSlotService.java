package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.TimeSlot;
import com.example.onlinedoctorappointment.repository.TimeSlotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    public TimeSlotService(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    /**
     * Doctor creates time slot (service-level creation)
     */
    public TimeSlot createSlot(Long doctorId,
                               LocalDateTime start,
                               LocalDateTime end) {

        if (doctorId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor ID must be provided"
            );
        }

        if (start == null || end == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time and end time must be provided"
            );
        }

        if (!end.isAfter(start)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time"
            );
        }

        TimeSlot slot = new TimeSlot(doctorId, start, end);
        return timeSlotRepository.save(slot);
    }

    /**
     * Create time slot directly from controller POST
     */
    public TimeSlot createTimeSlot(TimeSlot timeSlot) {

        if (timeSlot.getDoctorId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor ID is required"
            );
        }

        if (timeSlot.getStartTime() == null || timeSlot.getEndTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time and end time are required"
            );
        }

        if (!timeSlot.getEndTime().isAfter(timeSlot.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time"
            );
        }

        return timeSlotRepository.save(timeSlot);
    }

    /**
     * Get all time slots
     */
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAll();
    }

    /**
     * Get available slots for a doctor
     */
    public List<TimeSlot> getAvailableSlotsByDoctor(Long doctorId) {

        if (doctorId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor ID must be provided"
            );
        }

        return timeSlotRepository.findByDoctorIdAndAvailableTrue(doctorId);
    }

    /**
     * Filter available slots after given time
     */
    public List<TimeSlot> getAvailableSlotsAfter(LocalDateTime time) {

        if (time == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Time parameter is required"
            );
        }

        return timeSlotRepository.findByAvailableTrueAndStartTimeAfter(time);
    }

    /**
     * Mark slot as unavailable (called when appointment created)
     */
    public void occupySlot(Long slotId) {

        if (slotId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Slot ID must be provided"
            );
        }

        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Time slot not found"
                ));

        if (!slot.isAvailable()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Time slot already booked"
            );
        }

        slot.setAvailable(false);
        timeSlotRepository.save(slot);
    }
}
