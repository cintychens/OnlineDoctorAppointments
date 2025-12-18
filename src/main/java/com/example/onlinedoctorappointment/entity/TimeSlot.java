package com.example.onlinedoctorappointment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_slots")
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Belongs to which doctor */
    private Long doctorId;

    /** Start time */
    private LocalDateTime startTime;

    /** End time */
    private LocalDateTime endTime;

    /** Whether this slot is still available */
    private boolean available = true;

    public TimeSlot() {}

    public TimeSlot(Long doctorId, LocalDateTime startTime, LocalDateTime endTime) {
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = true;
    }

    // ===== getters & setters =====

    public Long getId() {
        return id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
