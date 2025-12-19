/*************************************************
 * Admin Module - Doctor Management
 * Data Source:
 *   - Doctors:   localStorage (system_doctors)
 *   - Schedules: localStorage (doctor_schedules)
 *
 * Business Rules:
 *   - Room is manually entered by admin
 *   - One room can only be used by ONE doctor at the SAME time slot
 *************************************************/

const DOCTOR_KEY = "system_doctors";
const SCHEDULE_KEY = "doctor_schedules";

/* =================================================
 * Doctors - 工具函数
 * ================================================= */
function getDoctors() {
    return JSON.parse(localStorage.getItem(DOCTOR_KEY)) || [];
}

function saveDoctors(doctors) {
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctors));
}

/* =================================================
 * Schedules - 工具函数
 * ================================================= */
function getSchedules() {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
}

function saveSchedules(list) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(list));
}

/* =================================================
 * 初始化示例医生（只执行一次）
 * ================================================= */
function initDoctors() {
    const doctors = getDoctors();

    if (!doctors || doctors.length === 0) {
        const demoDoctors = [
            {
                id: 1,
                name: "Dr. Smith",
                specialty: "Cardiology",
                room: "Room 302",
                enabled: true
            },
            {
                id: 2,
                name: "Dr. Brown",
                specialty: "Dermatology",
                room: "Room 210",
                enabled: true
            }
        ];
        saveDoctors(demoDoctors);
    }
}


/* =================================================
 * 校验：Room 是否已被占用（创建医生用）
 * ================================================= */
function isRoomOccupied(room) {
    const doctors = getDoctors();
    return doctors.some(d =>
        d.room &&
        d.room.toLowerCase() === room.toLowerCase()
    );
}

/* =================================================
 * 创建医生（Room 唯一校验）
 * ================================================= */
function createDoctor() {
    const nameInput = document.getElementById("doctorName");
    const specialtyInput = document.getElementById("doctorSpecialty");
    const roomInput = document.getElementById("doctorRoom");

    const name = nameInput.value.trim();
    const specialty = specialtyInput.value.trim();
    const room = roomInput.value.trim();

    if (!name || !specialty || !room) {
        alert("Please enter doctor name, specialty and room.");
        return;
    }

    if (isRoomOccupied(room)) {
        alert(`Room "${room}" is already assigned to another doctor.`);
        return;
    }

    const doctors = getDoctors();
    doctors.push({
        id: Date.now(),
        name,
        specialty,
        room,
        enabled: true
    });

    saveDoctors(doctors);

    nameInput.value = "";
    specialtyInput.value = "";
    roomInput.value = "";

    renderDoctorTable();
}

/* =================================================
 * 启用 / 禁用医生
 * ================================================= */
function toggleDoctor(id) {
    const doctors = getDoctors();
    const doctor = doctors.find(d => d.id === id);

    if (doctor) {
        doctor.enabled = !doctor.enabled;
        saveDoctors(doctors);
        renderDoctorTable();
    }
}

/* =================================================
 * 删除医生
 * ================================================= */
function deleteDoctor(doctorId) {
    if (!confirm("Delete this doctor?")) return;

    // 删除医生
    let doctors = getDoctors();
    doctors = doctors.filter(d => d.id !== doctorId);
    saveDoctors(doctors);

    // 同时删除该医生的所有排班（重要）
    let schedules = getSchedules();
    schedules = schedules.filter(s => s.doctorId !== doctorId);
    saveSchedules(schedules);

    renderDoctorTable();
}

/* =================================================
 * 时间重叠判断（核心算法）
 * ================================================= */
function isTimeOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

/* =================================================
 * Room + Time Slot 冲突检测
 * ================================================= */
function hasRoomTimeConflict(room, date, start, end) {
    if (!room) return false;
    const schedules = getSchedules();

    const roomLower = String(room).toLowerCase();

    return schedules.some(s => {
        // ⭐ 防御：旧数据/脏数据可能没有 room
        if (!s || !s.room) return false;

        return String(s.room).toLowerCase() === roomLower
            && s.date === date
            && isTimeOverlap(start, end, s.startTime, s.endTime);
    });
}

function addScheduleInline(doctorId) {
    editingScheduleId = null; // 明确是“新增模式”
    const doctor = getDoctors().find(d => d.id === doctorId);
    if (!doctor) {
        alert("Doctor not found");
        return;
    }

    const editor = document.getElementById("scheduleEditor");

    // ⭐⭐ 核心：强制写入 doctorId
    editor.dataset.doctorId = String(doctorId);
    // 初始化表单（新增模式）
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    document.getElementById("editDate").value = today;

    generateTimeSelect("editStart");
    generateTimeSelect("editEnd");
    editor.style.display = "flex";

    console.log("Add Schedule for doctorId =", editor.dataset.doctorId);
}

function generateTimeSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";
    for (let h = 8; h <= 20; h++) {
        ["00","30"].forEach(m => {
            const t = `${String(h).padStart(2,"0")}:${m}`;
            select.innerHTML += `<option value="${t}">${t}</option>`;
        });
    }
}
let editingScheduleId = null;

function showEditScheduleForm(scheduleId) {
    const s = getSchedules().find(x => x.id === scheduleId);
    if (!s) return;

    editingScheduleId = scheduleId;
    document.getElementById("scheduleEditor").style.display = "block";

    document.getElementById("editDate").value = s.date;
    generateTimeSelect("editStart");
    generateTimeSelect("editEnd");
    document.getElementById("editStart").value = s.startTime;
    document.getElementById("editEnd").value = s.endTime;
}

function saveScheduleEdit() {
    try {
        const date = document.getElementById("editDate").value;
        const start = document.getElementById("editStart").value;
        const end = document.getElementById("editEnd").value;

        console.log("SAVE CLICKED:", {
            mode: editingScheduleId ? "EDIT" : "ADD",
            date, start, end
        });

        // ===== 1️⃣ 基本校验 =====
        if (!date || !start || !end) {
            alert("Please select date and time.");
            return;
        }

        if (start >= end) {
            alert("End time must be later than start time.");
            return;
        }

        const schedules = getSchedules();

        /* ================= 编辑已有 Schedule ================= */
        if (editingScheduleId !== null) {
            const s = schedules.find(x => x.id === editingScheduleId);

            if (!s) {
                alert("Editing schedule not found. Please reopen editor.");
                editingScheduleId = null;
                return;
            }

            const roomLower = s.room ? s.room.toLowerCase() : null;

            // ⭐ 防御式冲突检测
            const conflict = schedules.some(other => {
                if (!other || other.id === s.id) return false;
                if (!other.room || !roomLower) return false;

                return (
                    other.room.toLowerCase() === roomLower &&
                    other.date === date &&
                    isTimeOverlap(start, end, other.startTime, other.endTime)
                );
            });

            if (conflict) {
                alert("Room conflict detected.");
                return;
            }

            s.date = date;
            s.startTime = start;
            s.endTime = end;
        }

        /* ================= 新建 Schedule ================= */
        else {
            const editor = document.getElementById("scheduleEditor");
            const doctorId = Number(editor.dataset.doctorId);

            if (!doctorId) {
                alert("Doctor ID missing. Please click '+ Add Schedule' again.");
                return;
            }

            const doctor = getDoctors().find(d => d.id === doctorId);
            if (!doctor) {
                alert("Doctor not found.");
                return;
            }

            if (!doctor.room) {
                alert("Doctor room is missing. Please edit doctor info first.");
                return;
            }

            // ⭐ 使用防御版 room 冲突检测
            const roomLower = doctor.room.toLowerCase();
            const conflict = schedules.some(s => {
                if (!s || !s.room) return false;

                return (
                    s.room.toLowerCase() === roomLower &&
                    s.date === date &&
                    isTimeOverlap(start, end, s.startTime, s.endTime)
                );
            });

            if (conflict) {
                alert("Room conflict detected.");
                return;
            }

            schedules.push({
                id: Date.now(),
                doctorId,
                doctorName: doctor.name,
                room: doctor.room,
                date,
                startTime: start,
                endTime: end
            });
        }

        // ===== 4️⃣ 保存 & 刷新 UI =====
        saveSchedules(schedules);
        renderDoctorTable();

        editingScheduleId = null;
        closeEditor();

        alert("Schedule saved successfully!");
    } catch (e) {
        console.error("Save schedule failed:", e);
        alert("Save failed due to system error:\n" + e.message);
    }
}

function closeEditor() {
    document.getElementById("scheduleEditor").style.display = "none";
}

/* =================================================
 * 渲染医生表格
 * ================================================= */
function renderDoctorTable() {
    const tbody = document.getElementById("doctorTableBody");
    tbody.innerHTML = "";

    const doctors = getDoctors();

    doctors.forEach(doctor => {

        // ⭐ 1. 只取这个医生的排班
        const schedules = getSchedules().filter(
            s => s.doctorId === doctor.id
        );

        // ⭐ 2. 渲染排班小列表
        const scheduleHtml = schedules.length === 0
            ? `<em>No schedule</em>`
            : schedules.map(s => `
                <div style="margin-bottom:4px">
                    ${s.date} ${s.startTime}-${s.endTime}
                    <button onclick="showEditScheduleForm(${s.id})">Edit</button>
                    <button onclick="deleteSchedule(${s.id})">×</button>
                </div>
            `).join("");

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${doctor.room}</td>
            <td>${scheduleHtml}</td>
            <td>
                <button onclick="toggleDoctor(${doctor.id})">
                    ${doctor.enabled ? "Disable" : "Enable"}
                </button>
                <button onclick="addScheduleInline(${doctor.id})">
                    + Add Schedule
                </button>
                <button onclick="deleteDoctor(${doctor.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* =================================================
 * 页面加载初始化
 * ================================================= */
document.addEventListener("DOMContentLoaded", () => {
    initDoctors();
    renderDoctorTable();
});

