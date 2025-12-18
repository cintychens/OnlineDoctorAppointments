/*************************************************
 * Doctor Module - Shared State (localStorage)
 * Used by:
 *  - doctor/dashboard.html
 *  - doctor/appointments.html
 *  - doctor/schedule.html
 *************************************************/

const STORAGE_KEY = "doctor_appointments";

/* ========= 初始化模拟数据（只在第一次） ========= */
function initAppointments() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const demoData = [
            {
                id: 1,
                patientName: "John Doe",
                date: "2025-01-10",
                time: "10:00 - 10:30",
                reason: "General Consultation",
                note: "First visit",
                status: "pending",
                source: "Online Booking"
            },
            {
                id: 2,
                patientName: "Alice Brown",
                date: "2025-01-10",
                time: "11:00 - 11:30",
                reason: "Follow-up",
                note: "",
                status: "confirmed",
                source: "Online Booking"
            },
            {
                id: 3,
                patientName: "Mark Wilson",
                date: "2025-01-09",
                time: "14:00 - 14:30",
                reason: "Prescription Renewal",
                note: "Needs refill",
                status: "completed",
                source: "Online Booking"
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    }
}

/* ========= 基础工具函数 ========= */
function getAppointments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveAppointments(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ========= 预约状态操作 ========= */
function updateAppointmentStatus(id, newStatus) {
    const list = getAppointments();
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
    const list = getAppointments();

    return {
        todayTotal: list.filter(a => a.date === today).length,
        pending: list.filter(a => a.status === "pending").length,
        total: list.length
    };
}

function renderDoctorDashboard() {
    const stats = getTodayStats();

    // 数字统计
    const todayEl = document.getElementById("todayCount");
    const pendingEl = document.getElementById("pendingCount");
    const totalEl = document.getElementById("totalCount");

    if (todayEl) todayEl.innerText = stats.todayTotal;
    if (pendingEl) pendingEl.innerText = stats.pending;
    if (totalEl) totalEl.innerText = stats.total;

    // 今日预约表格
    renderTodayAppointments();
}

function renderTodayAppointments() {
    const tbody = document.getElementById("todayAppointmentsBody");
    if (!tbody) return;

    const today = new Date().toISOString().split("T")[0];
    const list = getAppointments().filter(a => a.date === today);

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
            <td>${a.time}</td>
            <td>${a.patientName}</td>
            <td>${a.reason}</td>
            <td>
                <span class="badge ${a.status}">
                    ${capitalize(a.status)}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


/* ========= Appointments 页面渲染 ========= */
function renderAppointmentsTable(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const list = getAppointments();
    tbody.innerHTML = "";

    list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><i class="fas fa-user"></i> ${a.patientName}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.reason}</td>
            <td>
                <span class="badge ${a.status}">${capitalize(a.status)}</span>
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
                <i class="fas fa-check"></i> Accept
            </button>
            <button class="btn-danger" onclick="rejectAppointment(${a.id})">
                <i class="fas fa-times"></i> Reject
            </button>
            <button class="btn-secondary" onclick="viewDetail(${a.id})">
                View
            </button>
        `;
    }
    return `
        <button class="btn-secondary" onclick="viewDetail(${a.id})">
            View
        </button>
    `;
}

/* ========= 操作入口 ========= */
function acceptAppointment(id) {
    updateAppointmentStatus(id, "confirmed");
    notifyDoctorPages();
}
function rejectAppointment(id) {
    updateAppointmentStatus(id, "rejected");
    notifyDoctorPages();
}

/* ========= 预约详情（弹窗 / 简单版） ========= */
function viewDetail(id) {
    const a = getAppointments().find(x => x.id === id);
    if (!a) return;

    alert(
        `Patient: ${a.patientName}\n` +
        `Date: ${a.date}\n` +
        `Time: ${a.time}\n` +
        `Reason: ${a.reason}\n` +
        `Note: ${a.note || "N/A"}\n` +
        `Source: ${a.source}\n` +
        `Status: ${a.status}`
    );
}

/* ========= Schedule 页面辅助 ========= */
function getBookedSlots(date) {
    return getAppointments()
        .filter(a => a.date === date && a.status !== "rejected")
        .map(a => a.time);
}

/* ========= 工具 ========= */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ========= 页面加载 ========= */
document.addEventListener("DOMContentLoaded", () => {
    initAppointments();
});
function notifyDoctorPages() {
    // appointments 页面
    if (document.getElementById("appointmentsBody")) {
        renderAppointmentsTable("appointmentsBody");
    }

    // dashboard 页面
    if (typeof renderDoctorDashboard === "function") {
        renderDoctorDashboard();
    }

    // schedule 页面
    if (typeof refreshSchedule === "function") {
        refreshSchedule();
    }
}
/*************************************************
 * Schedule Module - Doctor Available Time Slots
 *************************************************/

const SLOT_KEY = "doctor_time_slots";

function getTimeSlots() {
    return JSON.parse(localStorage.getItem(SLOT_KEY)) || [];
}

function saveTimeSlots(list) {
    localStorage.setItem(SLOT_KEY, JSON.stringify(list));
}

/* 初始化（只保证 key 存在） */
function initDoctorSchedule() {
    if (!localStorage.getItem(SLOT_KEY)) {
        saveTimeSlots([]);
    }
    refreshSchedule();
}

/* 从表单添加时间段 */
function addTimeSlotFromForm(date, start, end, type) {
    if (!date || !start || !end) {
        alert("Please fill in date and time.");
        return;
    }

    const list = getTimeSlots();

    list.push({
        id: Date.now(),
        date,
        time: `${start} - ${end}`,
        type
    });

    saveTimeSlots(list);
    refreshSchedule();
}

/* 渲染时间段列表 */
function refreshSchedule() {
    const container = document.getElementById("slotsList");
    if (!container) return;

    const list = getTimeSlots();
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML =
            `<p style="color:#999;">No time slots added.</p>`;
        return;
    }

    list.forEach(s => {
        const div = document.createElement("div");
        div.className = "slot-item";
        div.innerHTML = `
            <strong>${s.date}</strong>
            <span>${s.time}</span>
            <span class="badge">${s.type}</span>
        `;
        container.appendChild(div);
    });
}
