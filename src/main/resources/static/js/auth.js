// 登录逻辑
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // 空值校验
    if (!username || !password) {
        alert('Please enter username and password!');
        return;
    }

    // 调用后端登录接口
    const res = await postRequest('/users/login', {
        username,
        password,
        role
    });

    // 登录成功跳转
    if (res.code === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', role);
        // 根据角色跳转对应页面
        switch (role) {
            case 'admin':
                window.location.href = '/admin/dashboard.html';
                break;
            case 'doctor':
                window.location.href = '/doctor/dashboard.html';
                break;
            case 'patient':
                window.location.href = '/patient/index.html';
                break;
        }
    } else {
        alert(res.message || 'Login failed!');
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