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
                enabled: true,
                status: "approved"
            },
            {
                id: 2,
                name: "Dr. Brown",
                specialty: "Dermatology",
                room: "Room 210",
                enabled: false,
                status: "pending"
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
    const name = doctorName.value.trim();
    const specialty = doctorSpecialty.value;
    const room = doctorRoom.value.trim();

    const initDate = document.getElementById("initDate").value;
    const initStart = document.getElementById("initStart").value;
    const initEnd = document.getElementById("initEnd").value;

    if (!name || !specialty || !room) {
        alert("Please complete doctor information.");
        return;
    }

    const doctors = getDoctors();
    const schedules = getSchedules();

    // ⭐ 如果填写了初始时间，才做冲突校验
    if (initDate && initStart && initEnd) {
        if (initStart >= initEnd) {
            alert("End time must be later than start time.");
            return;
        }

        const conflict = schedules.some(s =>
            s.room.toLowerCase() === room.toLowerCase() &&
            s.date === initDate &&
            isTimeOverlap(initStart, initEnd, s.startTime, s.endTime)
        );

        if (conflict) {
            alert(`Room ${room} is already occupied during this time.`);
            return;
        }
    }

    // ✅ 创建医生
    const doctorId = Date.now();
    doctors.push({
        id: doctorId,
        name,
        specialty,
        room,
        status: "approved",
        enabled: true
    });

    // ✅ 如果有初始时间 → 自动创建 schedule
    if (initDate && initStart && initEnd) {
        schedules.push({
            id: Date.now() + 1,
            doctorId,
            doctorName: name,
            room,
            date: initDate,
            startTime: initStart,
            endTime: initEnd
        });
    }

    saveDoctors(doctors);
    saveSchedules(schedules);
    renderDoctorTable();

    alert("Doctor created successfully.");
}

function approveDoctor(id) {
    const doctors = getDoctors();
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) return;

    doctor.approved = true;
    doctor.enabled = true;
    doctor.status = "approved";

    saveDoctors(doctors);
    renderDoctorTable();
}

function rejectDoctor(id) {
    const doctors = getDoctors();
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) return;

    doctor.approved = false;
    doctor.enabled = false;
    doctor.status = "rejected";

    saveDoctors(doctors);
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
function hasRoomConflict(room, date, startTime, endTime, ignoreScheduleId = null) {
    const schedules = getSchedules();
    const doctors = getDoctors();

    for (const s of schedules) {

        // 编辑时，跳过自己
        if (ignoreScheduleId && s.id === ignoreScheduleId) continue;

        if (s.date !== date) continue;

        const doctor = doctors.find(d => d.id === s.doctorId);
        if (!doctor) continue;

        // 同一个诊室
        if (doctor.room !== room) continue;

        // 时间是否重叠
        if (isTimeOverlap(startTime, endTime, s.startTime, s.endTime)) {
            return true;
        }
    }

    return false;
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
            mode: editingScheduleId !== null ? "EDIT" : "ADD",
            date, start, end
        });

        /* ========= 1️⃣ 基础校验 ========= */
        if (!date || !start || !end) {
            alert("Please select date and time.");
            return;
        }

        if (start >= end) {
            alert("End time must be later than start time.");
            return;
        }

        const schedules = getSchedules();
        const doctors = getDoctors();

        let doctor = null;
        let currentRoom = null;

        /* ========= 2️⃣ 区分编辑 / 新建 ========= */

        if (editingScheduleId !== null) {
            // ===== 编辑已有 schedule =====
            const s = schedules.find(x => x.id === editingScheduleId);
            if (!s) {
                alert("Editing schedule not found. Please reopen editor.");
                editingScheduleId = null;
                return;
            }

            doctor = doctors.find(d => d.id === s.doctorId);
            if (!doctor || !doctor.room) {
                alert("Doctor or room information missing.");
                return;
            }

            currentRoom = doctor.room;

            // ⭐ 诊室冲突检测（忽略自己）
            const conflict = schedules.some(other => {
                if (!other || other.id === s.id) return false;
                if (!other.room) return false;

                return (
                    other.room.toLowerCase() === currentRoom.toLowerCase() &&
                    other.date === date &&
                    isTimeOverlap(start, end, other.startTime, other.endTime)
                );
            });

            if (conflict) {
                alert(`Room ${currentRoom} is already occupied during this time.`);
                return;
            }

            // ✅ 更新 schedule
            s.date = date;
            s.startTime = start;
            s.endTime = end;
        }
        else {
            // ===== 新建 schedule =====
            const editor = document.getElementById("scheduleEditor");
            const doctorId = Number(editor.dataset.doctorId);

            if (!doctorId) {
                alert("Doctor ID missing. Please click '+ Add Schedule' again.");
                return;
            }

            doctor = doctors.find(d => d.id === doctorId);
            if (!doctor || !doctor.room) {
                alert("Doctor or room information missing.");
                return;
            }

            currentRoom = doctor.room;

            // ⭐ 诊室冲突检测
            const conflict = schedules.some(s => {
                if (!s || !s.room) return false;

                return (
                    s.room.toLowerCase() === currentRoom.toLowerCase() &&
                    s.date === date &&
                    isTimeOverlap(start, end, s.startTime, s.endTime)
                );
            });

            if (conflict) {
                alert(`Room ${currentRoom} is already occupied during this time.`);
                return;
            }

            // ✅ 新增 schedule
            schedules.push({
                id: Date.now(),
                doctorId: doctor.id,
                doctorName: doctor.name,
                room: currentRoom,
                date,
                startTime: start,
                endTime: end
            });
        }

        /* ========= 3️⃣ 保存 & 刷新 ========= */
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

 function renderDoctorTable() {
     const tbody = document.getElementById("doctorTableBody");
     if (!tbody) return;

     tbody.innerHTML = "";

     const doctors = getDoctors();
     const schedulesAll = getSchedules();

     doctors.forEach(doctor => {

         const status = doctor.status || "pending"; // ⭐ 统一入口

         const schedules = schedulesAll.filter(
             s => s.doctorId === doctor.id
         );

         const scheduleHtml =
             status !== "approved"
                 ? `<em>Not approved</em>`
                 : (schedules.length === 0
                     ? `<em>No schedule</em>`
                     : schedules.map(s => `
                         <div style="margin-bottom:4px">
                             ${s.date} ${s.startTime}-${s.endTime}
                             <button onclick="showEditScheduleForm(${s.id})">Edit</button>
                             <button onclick="deleteSchedule(${s.id})">×</button>
                         </div>
                     `).join("")
                 );

         let actionHtml = "";

         if (status === "pending") {
             actionHtml = `
                 <button onclick="approveDoctor(${doctor.id})">Approve</button>
                 <button onclick="rejectDoctor(${doctor.id})">Reject</button>
             `;
         } else if (status === "approved") {
             actionHtml = `
                 <button onclick="toggleDoctor(${doctor.id})">
                     ${doctor.enabled ? "Disable" : "Enable"}
                 </button>
                 <button onclick="addScheduleInline(${doctor.id})">
                     + Add Schedule
                 </button>
                 <button onclick="deleteDoctor(${doctor.id})">
                     Delete
                 </button>
             `;
         } else {
             actionHtml = `<em>Rejected</em>`;
         }

         const tr = document.createElement("tr");
         tr.innerHTML = `
             <td>${doctor.id}</td>
             <td>${doctor.name}</td>
             <td>${doctor.specialty}</td>
             <td>${doctor.room}</td>
             <td>${scheduleHtml}</td>
             <td>${actionHtml}</td>
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

