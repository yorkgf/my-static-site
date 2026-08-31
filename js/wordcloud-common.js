/* 课堂词云 — 前端共享逻辑 */

// API：腾讯云 SCF Web 函数（与小组系统同一个函数）
const FUNCTION_URL = 'https://1300190563-65pzez22z8.ap-shanghai.tencentscf.com';
const API_BASE = (function () {
  try {
    return localStorage.getItem('wcApiBase') || FUNCTION_URL;
  } catch (e) {
    return FUNCTION_URL;
  }
})();

const WC_TEACHER_TOKEN_KEY = 'wcTeacherToken';

function getTeacherToken() {
  try { return localStorage.getItem(WC_TEACHER_TOKEN_KEY) || ''; } catch (e) { return ''; }
}
function setTeacherToken(token) {
  try {
    if (token) localStorage.setItem(WC_TEACHER_TOKEN_KEY, token);
    else localStorage.removeItem(WC_TEACHER_TOKEN_KEY);
  } catch (e) { /* ignore */ }
}

/** 统一 API 请求；失败时抛出 Error(中文提示) */
async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('无法连接服务器，请检查网络后刷新重试');
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) { /* 非 JSON */ }

  if (res.status === 401 && token) {
    throw Object.assign(new Error(data.error || '登录已过期，请重新登录'), { expired: true });
  }
  if (!res.ok) {
    throw new Error(data.error || `请求失败（${res.status}）`);
  }
  return data;
}

/** HTML 转义 */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toast(message, type = 'info') {
  let box = document.getElementById('toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast';
    document.body.appendChild(box);
  }
  const msg = document.createElement('div');
  msg.className = 'toast-msg ' + (type === 'error' ? 'error' : 'success');
  msg.textContent = message;
  box.appendChild(msg);
  setTimeout(() => msg.remove(), 3500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

window.WC = { API_BASE, getTeacherToken, setTeacherToken, api, esc, toast, copyText };
