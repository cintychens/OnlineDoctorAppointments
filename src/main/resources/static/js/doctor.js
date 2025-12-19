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

/* =================================================
 * 登录态
 * ================================================= */
function getCurrentDoctor() {
    let u = null;

    try {
        u = JSON.parse(localStorage.getItem(DOCTOR_KEY));
    } catch (e) {}

    if (!u) {
        try {
            u = JSON.parse(localStorage.getItem("currentUser"));
        } catch (e) {}
    }

    if (!u) return null;

    const role = (u.role || "").toLowerCase();
    if (role !== "doctor") return null;

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
 * ⭐ 统一排序函数（核心）
 * 最新日期 + 时间 + id 在最上
 * ================================================= */
function sortByDateTimeDesc(list) {
    return list.slice().sort((a, b) => {

        const getTimeValue = (x) => {
            // 新结构
            if (x.startTime) {
                return new Date(`${x.date} ${x.startTime}`).getTime();
            }
            // 老结构
            if (x.time) {
                return new Date(`${x.date} ${x.time.split(" - ")[0]}`).getTime();
            }
            return 0;
        };

        const t1 = getTimeValue(a);
        const t2 = getTimeValue(b);

        if (t1 !== t2) return t2 - t1;
        return (b.id || 0) - (a.id || 0);
    });
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
    const list = sortByDateTimeDesc(
        getAllAppointments().filter(a => a.date === today)
    );

    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:#999;">
                    No appointments today
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                ${
                    a.startTime
                        ? `${a.startTime} - ${a.endTime}`
                        : (a.time || "-")
                }
            </td>

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
 * Appointments 页面
 *************************************************/
function renderAppointmentsTable(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const list = sortByDateTimeDesc(getAllAppointments());
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

function renderAppointmentsTableWithList(tbodyId, list) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const sorted = sortByDateTimeDesc(list);
    tbody.innerHTML = "";

    if (sorted.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#999;">
                    No appointments found.
                </td>
            </tr>
        `;
        return;
    }

    sorted.forEach(a => {
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
 * 操作按钮
 *************************************************/
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
