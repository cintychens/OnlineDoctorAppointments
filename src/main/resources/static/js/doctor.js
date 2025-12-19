/*************************************************
 * Doctor Console Module - Shared State (localStorage)
 * Role: Clinic-side Appointment Processing Console
 * Used by:
 *  - doctor/dashboard.html
 *  - doctor/appointments.html
 *  - doctor/profile.html
 *
 * Note:
 *  - Schedule is managed by Admin module (Doctor-side schedule removed)
 *************************************************/

const STORAGE_KEY = "doctor_appointments";
const DOCTOR_KEY = "current_doctor";

function getCurrentDoctor() {
    let u = null;

    // ✅ 使用已定义的 DOCTOR_KEY
    try {
        u = JSON.parse(localStorage.getItem(DOCTOR_KEY));
    } catch (e) {}

    // ② 兜底 currentUser（第一次登录）
    if (!u) {
        try {
            u = JSON.parse(localStorage.getItem("currentUser"));
        } catch (e) {}
    }

    if (!u) return null;

    const role = (u.role || "").toLowerCase();
    if (role !== "doctor") return null;

    // 🔒 固化 doctor 登录态
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(u));

    return u;
}

/* =================================================
 * 基础工具函数
 * ================================================= */
function getAllAppointments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAppointments(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* =================================================
 * 预约状态操作
 * ================================================= */
function updateAppointmentStatus(id, newStatus) {
    const list = getAllAppointments();
    const appt = list.find(a => a.id === id);
    if (appt) {
        appt.status = newStatus;
        saveAppointments(list);
    }
}

/*************************************************
 * Dashboard Statistics & Today's Appointments
 *************************************************/
function getTodayStats() {
    const today = new Date().toISOString().split("T")[0];
    const list = getAllAppointments();

    return {
        todayTotal: list.filter(a => a.date === today).length,
        pending: list.filter(a => a.status === "pending").length,
        total: list.length
    };
}

function renderDoctorDashboard() {
    const stats = getTodayStats();

    const todayEl = document.getElementById("todayCount");
    const pendingEl = document.getElementById("pendingCount");
    const totalEl = document.getElementById("totalCount");

    if (todayEl) todayEl.innerText = stats.todayTotal;
    if (pendingEl) pendingEl.innerText = stats.pending;
    if (totalEl) totalEl.innerText = stats.total;

    renderTodayAppointments();
}

function renderTodayAppointments() {
    const tbody = document.getElementById("todayAppointmentsBody");
    if (!tbody) return;

    const today = new Date().toISOString().split("T")[0];
    const list = getAllAppointments().filter(a => a.date === today);

    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#999;">
                    No appointments today
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.startTime} - ${a.endTime}</td>
            <td>${a.patientName}</td>
            <td>${a.doctorName || "-"}</td>
            <td>
                <span class="badge ${a.status}">
                    ${capitalize(a.status)}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/*************************************************
 * Appointments 页面渲染
 *************************************************/
function renderAppointmentsTable(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const list = getAllAppointments();
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:#999;">
                    No appointments found.
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><i class="fas fa-user"></i> ${a.patientName}</td>
            <td>${a.doctorName || "-"}</td>
            <td>${a.date}</td>
            <td>${a.startTime} - ${a.endTime}</td>
            <td>
                <span class="badge ${a.status}">
                    ${capitalize(a.status)}
                </span>
            </td>
            <td>
                ${renderActionButtons(a)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderActionButtons(a) {
    if (a.status === "pending") {
        return `
            <button class="btn-success" onclick="acceptAppointment(${a.id})">
                Accept
            </button>
            <button class="btn-danger" onclick="rejectAppointment(${a.id})">
                Reject
            </button>
        `;
    }
    if (a.status === "confirmed") {
        return `
            <button class="btn-secondary" onclick="completeAppointment(${a.id})">
                Complete
            </button>
        `;
    }
    return `<em>-</em>`;
}

/*************************************************
 * 操作入口
 *************************************************/
function acceptAppointment(id) {
    updateAppointmentStatus(id, "confirmed");
    notifyDoctorPages();
}

function rejectAppointment(id) {
    updateAppointmentStatus(id, "rejected");
    notifyDoctorPages();
}

function completeAppointment(id) {
    updateAppointmentStatus(id, "completed");
    notifyDoctorPages();
}

/*************************************************
 * 预约详情（简化版）
 *************************************************/
function viewDetail(id) {
    const a = getAllAppointments().find(x => x.id === id);
    if (!a) return;

    alert(
        `Patient: ${a.patientName}\n` +
        `Doctor: ${a.doctorName}\n` +
        `Date: ${a.date}\n` +
        `Time: ${a.startTime} - ${a.endTime}\n` +
        `Status: ${a.status}`
    );
}

function renderAppointmentsTableWithList(tbodyId, list) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#999;">
                    No appointments found.
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.patientName}</td>
            <td>${a.date}</td>
            <td>${a.startTime} - ${a.endTime}</td>
            <td>
                <span class="badge ${a.status}">
                    ${capitalize(a.status)}
                </span>
            </td>
            <td>
                ${renderActionButtons(a)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/*************************************************
 * 工具
 *************************************************/
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/*************************************************
 * 页面加载
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
    const doctor = getCurrentDoctor();
    if (!doctor) {
        location.href = "/auth/login.html";
        return;
    }

    notifyDoctorPages();
});

function notifyDoctorPages() {
    if (document.getElementById("appointmentsBody")) {
        renderAppointmentsTable("appointmentsBody");
    }

    if (typeof renderDoctorDashboard === "function") {
        renderDoctorDashboard();
    }
}
