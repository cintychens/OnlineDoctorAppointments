package com.example.onlinedoctorappointment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Doctor name */
    private String name;

    /** Specialty (e.g. Psychology, Cardiology) */
    private String specialty;

    /** Brief description */
    private String description;

    /** Whether the doctor is available */
    private boolean enabled = true;

    // ===== Constructors =====

    public Doctor() {
    }

    public Doctor(String name, String specialty, String description) {
        this.name = name;
        this.specialty = specialty;
        this.description = description;
        this.enabled = true;
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
