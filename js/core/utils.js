/**
 * UTILS — WebPOS V2
 * Helper universal: format rupiah, tanggal, toast, modal, dsb.
 */

const Utils = {
    formatRupiah(angka) {
        if (angka === null || angka === undefined || isNaN(angka)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    },

    parseRupiah(str) {
        if (!str) return 0;
        return parseInt(str.replace(/[^0-9]/g, '')) || 0;
    },

    formatDate(date, withTime = false) {
        const d = date instanceof Date ? date : new Date(date);
        const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
        if (withTime) {
            opts.hour = '2-digit';
            opts.minute = '2-digit';
        }
        return d.toLocaleDateString('id-ID', opts);
    },

    getDateKey(date = new Date()) {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    },

    generateId(prefix = 'id') {
        return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    },

    toast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
            document.body.appendChild(container);
        }

        const el = document.createElement('div');
        const colors = {
            info: 'background:var(--primary);color:#fff;',
            success: 'background:var(--success);color:#fff;',
            warning: 'background:var(--warning);color:#000;',
            error: 'background:var(--danger);color:#fff;'
        };
        el.style.cssText = colors[type] + colors.info + 'padding:12px 18px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform 0.3s ease;max-width:300px;word-wrap:break-word;';
        el.textContent = message;
        container.appendChild(el);

        requestAnimationFrame(() => {
            el.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            el.style.transform = 'translateX(120%)';
            setTimeout(() => el.remove(), 300);
        }, duration);
    },

    confirmDialog(title, message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            overlay.innerHTML = `
                <div style="background:var(--card);color:var(--text);padding:24px;border-radius:12px;max-width:320px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                    <h3 style="margin:0 0 8px;font-size:18px;">${title}</h3>
                    <p style="margin:0 0 20px;font-size:14px;color:var(--text-muted);line-height:1.5;">${message}</p>
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button id="btn-cancel" style="padding:8px 16px;border:1px solid var(--border);background:transparent;color:var(--text);border-radius:6px;cursor:pointer;font-size:14px;">Batal</button>
                        <button id="btn-ok" style="padding:8px 16px;border:none;background:var(--danger);color:#fff;border-radius:6px;cursor:pointer;font-size:14px;">Ya, Lanjutkan</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#btn-cancel').onclick = () => { overlay.remove(); resolve(false); };
            overlay.querySelector('#btn-ok').onclick = () => { overlay.remove(); resolve(true); };
            overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
        });
    },

    debounce(fn, ms = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    },

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
};

window.Utils = Utils;
