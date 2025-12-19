async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password) {
        alert('Please enter username and password!');
        return;
    }

    const res = await postRequest('/users/login', {
        username,
        password,
        role
    });

    if (res.code !== 200) {
        alert(res.message || 'Login failed!');
        return;
    }

    /* ===== 基础登录信息 ===== */
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', role);

    /* ===== ⭐ Doctor 审核校验 ===== */
    if (role === 'doctor') {
        const doctors =
            JSON.parse(localStorage.getItem('system_doctors')) || [];

        const doctor = doctors.find(d => d.name === username);

        if (!doctor) {
            alert('Doctor profile not found. Please contact admin.');
            localStorage.removeItem('token');
            return;
        }

        if (doctor.status !== 'approved') {
            alert(
                doctor.status === 'pending'
                    ? 'Your account is pending admin approval.'
                    : 'Your account has been rejected by admin.'
            );

            localStorage.removeItem('token');
            return;
        }

        // ✅ 审核通过，允许登录
        localStorage.setItem(
            'currentUser',
            JSON.stringify({
                id: doctor.id,
                username: doctor.name,
                role: 'doctor'
            })
        );

        window.location.href = '/doctor/dashboard.html';
        return;
    }

    /* ===== 其他角色 ===== */
    if (role === 'admin') {
        localStorage.setItem(
            'currentUser',
            JSON.stringify({
                username,
                role: 'admin'
            })
        );
        window.location.href = '/admin/dashboard.html';
        return;
    }

    if (role === 'patient') {
        localStorage.setItem(
            'currentUser',
            JSON.stringify({
                username,
                role: 'patient'
            })
        );
        window.location.href = '/patient/index.html';
    }
}

// 注册逻辑（适配register.html）
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password) {
        alert('Please enter username and password!');
        return;
    }

    const res = await postRequest('/users/register', {
        username,
        password,
        role
    });

    if (res.code === 200) {
        alert('Register success! Please login.');
        window.location.href = '/auth/login.html';
    } else {
        alert(res.message || 'Register failed!');
    }
}