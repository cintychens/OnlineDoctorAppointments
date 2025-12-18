// 通用接口请求工具 - 适配Spring Boot后端
const API_BASE_URL = '/api';

// POST请求封装
async function postRequest(url, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token') || '' // 登录令牌（可选）
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('请求失败:', error);
        alert('网络错误，请重试！');
    }
}

// GET请求封装
async function getRequest(url) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Authorization': localStorage.getItem('token') || ''
            }
        });
        return await response.json();
    } catch (error) {
        console.error('请求失败:', error);
        alert('网络错误，请重试！');
    }
}