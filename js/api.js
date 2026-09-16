/**
 * js/api.js
 * Lapisan komunikasi frontend ↔ Google Apps Script Web App.
 * Bentuk fungsi & nilai kembaliannya SENGAJA dibuat identik dengan objek
 * `api` mock di prototipe (index.html), supaya tinggal ganti file ini
 * tanpa mengubah kode UI.
 *
 * Catatan CORS: kirim POST dengan Content-Type "text/plain;charset=utf-8"
 * (bukan application/json) agar browser tidak mengirim preflight OPTIONS,
 * karena Apps Script Web App tidak bisa merespons preflight tersebut.
 */

const api = {
  async getMembers() {
    return gasGet('getMembers');
  },
  async getMember(id) {
    return gasGet('getMember', { id });
  },
  async getStats() {
    return gasGet('getStats');
  },
  async searchMembers(q) {
    return gasGet('searchMembers', { q });
  },
  async getSettings() {
    return gasGet('getSettings');
  },
  async addMember(data) {
    return gasPost({ action: 'addMember', data, email: getCurrentUserEmail() });
  },
  async updateMember(id, data) {
    return gasPost({ action: 'updateMember', id, data, email: getCurrentUserEmail() });
  },
  async deleteMember(id) {
    return gasPost({ action: 'deleteMember', id, email: getCurrentUserEmail() });
  },
  async login(email) {
    return gasPost({ action: 'login', email });
  }
};

async function gasGet(action, params) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set('action', action);
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  try {
    const res = await fetch(url.toString());
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Data belum dapat dimuat. Silakan coba lagi.', data: null };
  }
}

async function gasPost(body) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // lihat catatan CORS di atas
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.', data: null };
  }
}

function getCurrentUserEmail() {
  // Isi dari hasil Google Sign-In di frontend (lihat README.md bagian Keamanan).
  return window.__currentUserEmail || '';
}
