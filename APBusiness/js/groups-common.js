/* AP Business 小组系统 — 前端共享逻辑 */

// ═══ 部署配置 ═══
// AP Business 小组系统 API：腾讯云 SCF Web 函数（上海地域）
// 本地调试时可在浏览器控制台执行：
//   localStorage.setItem('apbApiBase', 'http://127.0.0.1:9000')
const FUNCTION_URL = 'https://1300190563-65pzez22z8.ap-shanghai.tencentscf.com';
const API_BASE = (function () {
  try {
    return localStorage.getItem('apbApiBase') || FUNCTION_URL;
  } catch (e) {
    return FUNCTION_URL;
  }
})();

const TOKEN_KEYS = {
  student: 'apbGroupToken',
  teacher: 'apbTeacherToken',
};

function getToken(kind) {
  try {
    return localStorage.getItem(TOKEN_KEYS[kind]) || '';
  } catch (e) {
    return '';
  }
}
function setToken(kind, token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEYS[kind], token);
    else localStorage.removeItem(TOKEN_KEYS[kind]);
  } catch (e) { /* 隐私模式等场景下降级为不持久化 */ }
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
  } catch (e) { /* 非 JSON 响应 */ }

  if (res.status === 401 && token) {
    // 令牌过期：清掉并提示重新登录
    throw Object.assign(new Error(data.error || '登录已过期，请重新登录'), { expired: true });
  }
  if (!res.ok) {
    throw new Error(data.error || `请求失败（${res.status}）`);
  }
  return data;
}

/** HTML 转义，防止学生输入的内容被当作 HTML 执行 */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return '无截止日期';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 返回 {label, cls} 表示截止状态 */
function dueStatus(iso) {
  if (!iso) return null;
  const due = new Date(iso);
  const now = new Date();
  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `已逾期 ${-days} 天`, cls: 'badge-overdue' };
  if (days === 0) return { label: '今天截止', cls: 'badge-soon' };
  if (days <= 3) return { label: `还剩 ${days} 天`, cls: 'badge-soon' };
  return { label: `还剩 ${days} 天`, cls: '' };
}

let toastTimer;
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
  setTimeout(() => msg.remove(), 4000);
}

window.APB = { API_BASE, getToken, setToken, api, esc, fmtDate, dueStatus, toast };
