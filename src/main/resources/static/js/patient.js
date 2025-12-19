/*************************************************
 * Patient Module - Shared Runtime (Robust Version)
 * Works with:
 *   - patient/index.html
 *   - patient/doctors.html
 *   - patient/appointments.html
 *   - patient/profile.html
 *************************************************/

/* =================================================
 * Keys (兼容两套登录态)
 * ================================================= */
const USER_KEY = "currentUser";          // 你系统里常用
const PATIENT_KEY = "current_patient";  // 你之前用过

const DOCTOR_KEY = "system_doctors";
const SCHEDULE_KEY = "doctor_schedules";
const APPOINTMENT_KEY = "doctor_appointments";

let patient = null;
let doctors = [];

/* =================================================
 * Auth - 兼容版（不再因为 role 大小写/缺失踢出）
 * ================================================= */
function getLoggedInPatient() {
    // 先取 currentUser
    let u = null;
    try {
        u = JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {}

    // 再兜底 current_patient
    if (!u) {
        try {
            u = JSON.parse(localStorage.getItem(PATIENT_KEY));
        } catch (e) {}
    }

    // 完全没有登录态
    if (!u) return null;

    // role 容错（有些系统 role 可能是 Patient / PATIENT / user / 空）
    const role = (u.role || "").toString().toLowerCase();
    if (role && role !== "patient") {
        // 如果明确不是 patient，就踢回去
        return null;
    }

    return u;
}

function checkPatientAuth() {
    const u = getLoggedInPatient();
    if (!u) {
        window.location.href = "/auth/login.html";
        return null;
    }
    return u;
}

function logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PATIENT_KEY);
    window.location.href = "/auth/login.html";
}

/* =================================================
 * Init - 对所有 patient 页面安全
 * ================================================= */
document.addEventListener("DOMContentLoaded", () => {
    patient = checkPatientAuth();
    if (!patient) return;

    const nameEl = document.getElementById("patientName");
    if (nameEl) {
        nameEl.innerText =
            patient.name || patient.username || "Patient";
    }

    const path = window.location.pathname;

    // ✅ 只在 doctors.html 加载医生列表
    if (path.includes("/patient/doctors.html")) {
        loadDoctors();
    }
});


/* =================================================
 * Doctors - Container 兜底（解决你页面 id 不一致导致的“空白”）
 * ================================================= */
function getDoctorListContainer() {
    return (
        document.getElementById("doctorList") ||
        document.getElementById("doctorGrid") ||
        document.getElementById("doctorContainer") ||
        document.querySelector("#doctorList") ||
        document.querySelector(".doctor-grid") ||
        null
    );
}

/* =================================================
 * Load Doctors & Schedules (Admin 数据源)
 * ================================================= */
function loadDoctors() {
    let allDoctors = [];
    let allSchedules = [];

    try {
        allDoctors = JSON.parse(localStorage.getItem(DOCTOR_KEY)) || [];
    } catch (e) {
        allDoctors = [];
    }

    try {
        allSchedules = JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
    } catch (e) {
        allSchedules = [];
    }

    // 🔎 关键排查信息：你一看就知道是否“互通”
    console.log("[Patient] Read doctors:", allDoctors.length, "schedules:", allSchedules.length);
    console.log("[Patient] Doctors raw:", allDoctors);
    console.log("[Patient] Schedules raw:", allSchedules);

    doctors = allDoctors
        .filter(d => d && d.enabled !== false) // enabled 缺失也当可用
        .map(d => ({
            id: d.id,
            name: d.name,
            department: d.specialty || d.department || "General",
            room: d.room || "Not Assigned",
            description: d.description || "No description available.",
            schedules: allSchedules.filter(s => s && s.doctorId === d.id)
        }));

    renderDoctors(doctors);
}

/* =================================================
 * Render Doctors
 * ================================================= */
function renderDoctors(list) {
    const container = getDoctorListContainer();
    if (!container) {
        console.error("[Patient] Doctor list container not found. Check doctors.html id/class.");
        return;
    }

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<p>No available doctors at the moment.</p>";
        return;
    }

    list.forEach(d => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-body">
                <h3><i class="fas fa-user-md"></i> ${escapeHtml(d.name)}</h3>
                <p><strong>Department:</strong> ${escapeHtml(d.department)}</p>
                <p><strong>Room:</strong> ${escapeHtml(d.room)}</p>
                <p>${escapeHtml(d.description)}</p>

                <button class="btn-primary" type="button"
                        onclick="viewDoctor(${Number(d.id)})">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/* =================================================
 * Search (optional)
 * ================================================= */
function filterDoctors() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const keyword = input.value.toLowerCase();

    const filtered = doctors.filter(d =>
        (d.name || "").toLowerCase().includes(keyword) ||
        (d.department || "").toLowerCase().includes(keyword) ||
        (d.room || "").toLowerCase().includes(keyword)
    );

    renderDoctors(filtered);
}

/* =================================================
 * Modal - 如果你的 doctors.html 没有 modal 结构，也不会炸
 * ================================================= */
function viewDoctor(id) {
    const d = doctors.find(x => Number(x.id) === Number(id));
    if (!d) return;

    const modal = document.getElementById("doctorModal");
    if (!modal) {
        // 兜底：没有 modal 就直接 alert 展示
        const scheduleText = (d.schedules || [])
            .map(s => `${s.date} ${s.startTime}-${s.endTime}`)
            .join("\n") || "No schedules";
        alert(`Doctor: ${d.name}\nDepartment: ${d.department}\nRoom: ${d.room}\n\nSchedules:\n${scheduleText}`);
        return;
    }

    // 有 modal 才填充
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setText("modalName", d.name);
    setText("modalDept", "Department: " + d.department);
    setText("modalRoom", "Room: " + d.room);
    setText("modalDesc", d.description);

    const slotBox = document.getElementById("modalSlots");
    if (slotBox) {
        slotBox.innerHTML = "";
        if (!d.schedules || d.schedules.length === 0) {
            slotBox.innerHTML = "<p>No available schedules.</p>";
        } else {
            d.schedules.forEach(s => {
                const btn = document.createElement("button");
                btn.className = "btn-primary";
                btn.type = "button";
                btn.style.marginRight = "10px";
                btn.style.marginTop = "8px";
                btn.innerText = `${s.date} ${s.startTime}-${s.endTime}`;
                btn.onclick = () => bookAppointment(d, s);
                slotBox.appendChild(btn);
            });
        }
    }

    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("doctorModal");
    if (modal) modal.style.display = "none";
}

/* =================================================
 * Book Appointment (写入 doctor_appointments)
 * ================================================= */
function bookAppointment(doctor, schedule) {
    const list = JSON.parse(localStorage.getItem(APPOINTMENT_KEY)) || [];

    list.push({
        id: Date.now(),
        patientId: patient.id,
        patientName: patient.name || patient.username,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: schedule.date,
        time: `${schedule.startTime}-${schedule.endTime}`,
        status: "pending"
    });

    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(list));

    alert("Appointment request submitted.");
    closeModal();
}

/* =================================================
 * Appointments helpers (appointments.html 会用到)
 * ================================================= */
function getMyAppointments(p) {
    const list = JSON.parse(localStorage.getItem(APPOINTMENT_KEY)) || [];
    return list.filter(a => a.patientId === p.id);
}

function cancelAppointmentByPatient(id, p) {
    const list = JSON.parse(localStorage.getItem(APPOINTMENT_KEY)) || [];
    const appt = list.find(a => a.id === id);

    if (!appt || appt.patientId !== p.id || appt.status !== "pending") {
        return false;
    }

    appt.status = "cancelled";
    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(list));
    return true;
}

function statusColor(status) {
    if (status === "pending") return "#f39c12";
    if (status === "confirmed") return "#2ecc71";
    if (status === "cancelled") return "#e74c3c";
    return "#888";
}

/* =================================================
 * Utils
 * ================================================= */
function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
