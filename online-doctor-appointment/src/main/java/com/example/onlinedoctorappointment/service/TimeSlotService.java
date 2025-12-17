package com.example.onlinedoctorappointment.service;

import com.example.onlinedoctorappointment.entity.TimeSlot;
import com.example.onlinedoctorappointment.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    public TimeSlotService(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    /** Doctor creates time slot */
    public TimeSlot createSlot(Long doctorId,
                               LocalDateTime start,
                               LocalDateTime end) {

        if (end.isBefore(start) || end.equals(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        TimeSlot slot = new TimeSlot(doctorId, start, end);
        return timeSlotRepository.save(slot);
    }

    /** Query available slots for a doctor */
    public List<TimeSlot> getAvailableSlots(Long doctorId) {
        return timeSlotRepository.findByDoctorIdAndAvailableTrue(doctorId);
    }

    public List<TimeSlot> getAvailableSlotsByDoctor(Long doctorId) {
        return timeSlotRepository.findByDoctorIdAndAvailableTrue(doctorId);
    }
    /** Create time slot directly (for controller POST) */
    public TimeSlot createTimeSlot(TimeSlot timeSlot) {
        return timeSlotRepository.save(timeSlot);
    }

    /** Get all time slots */
    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAll();
    }

    /** Get available slots after given time */
    public List<TimeSlot> getAvailableSlotsAfter(LocalDateTime time) {
        return timeSlotRepository.findByAvailableTrueAndStartTimeAfter(time);
    }

    /** Mark slot as unavailable (called when appointment created) */
    public void occupySlot(Long slotId) {
        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.isAvailable()) {
            throw new RuntimeException("Slot already booked");
        }

        slot.setAvailable(false);
        timeSlotRepository.save(slot);
    }
}
