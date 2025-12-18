package com.example.onlinedoctorappointment.repository;

import com.example.onlinedoctorappointment.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctorIdAndAvailableTrue(Long doctorId);

    List<TimeSlot> findByAvailableTrueAndStartTimeAfter(LocalDateTime time);
}
