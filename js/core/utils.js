/**
 * UTILS — WebPOS V2
 */

const Utils = {
    formatRupiah(angka) {
        if (angka === null || angka === undefined || isNaN(angka)) return 'Rp 0';
        return 'Rp ' + Number(angka).toLocaleString('id-ID');
    },

    formatDate(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    },

    formatDateTime(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    },

    todayKey() {
        return new Date().toISOString().slice(0,10).replace(/-/g,'');
    },

    toast(message, type = 'info', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        const icons = { success:'check-circle', error:'exclamation-circle', warning:'exclamation-triangle', info:'info-circle' };
        el.innerHTML = `<i class="fas fa-${icons[type]||'info-circle'}"></i><span>${message}</span>`;
        container.appendChild(el);
        setTimeout(() => { el.remove(); }, duration);
    },

    confirm(title, text, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:400px">
                <div class="modal-header"><div class="modal-title">${title}</div></div>
                <div class="modal-body">${text}</div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="btnCancel">Batal</button>
                    <button class="btn btn-danger" id="btnConfirm">Ya, Lanjutkan</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('#btnCancel').onclick = () => overlay.remove();
        overlay.querySelector('#btnConfirm').onclick = () => { overlay.remove(); onConfirm(); };
        overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
    },

    debounce(fn, wait) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    }
};

window.Utils = Utils;
