package com.example.onlinedoctorappointment.entity;

/**
 * Appointment lifecycle status
 */
public enum AppointmentStatus {
    PENDING,     // 已提交，待审核
    APPROVED,    // 已通过
    REJECTED,    // 被医生/管理员拒绝
    CANCELLED    // 用户取消
}
