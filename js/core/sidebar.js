/**
 * SIDEBAR — WebPOS V2
 * Render sidebar universal dengan dropdown.
 * Semua page pakai sidebar ini.
 */

const Sidebar = {
    menuStructure: [
        {
            id: 'utama',
            label: 'Utama',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            items: [
                { id: 'index', label: 'Dashboard', href: 'index.html' },
                { id: 'kasir', label: 'Kasir', href: 'kasir.html' },
                { id: 'produk', label: 'Produk', href: 'produk.html' }
            ]
        },
        {
            id: 'transaksi',
            label: 'Transaksi',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
            items: [
                { id: 'pembelian', label: 'Pembelian', href: 'pembelian.html' },
                { id: 'riwayat', label: 'Riwayat', href: 'riwayat.html' },
                { id: 'hutang', label: 'Hutang & Piutang', href: 'hutang.html' }
            ]
        },
        {
            id: 'keuangan',
            label: 'Keuangan',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
            items: [
                { id: 'kas', label: 'Kas Management', href: 'kas.html' },
                { id: 'laporan', label: 'Laporan', href: 'laporan.html' }
            ]
        },
        {
            id: 'lainnya',
            label: 'Lainnya',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
            items: [
                { id: 'pelanggan', label: 'Pelanggan', href: 'pelanggan.html' },
                { id: 'backup', label: 'Backup Data', href: 'backup.html' },
                { id: 'pengaturan', label: 'Pengaturan', href: 'pengaturan.html' }
            ]
        }
    ],

    render() {
        const container = document.getElementById('sidebar');
        if (!container) return;

        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const role = Auth.getUserRole() || 'kasir';
        const access = SettingsManager.getAccess(role);

        // Role badge colors
        const roleColors = {
            developer: '#8b5cf6',
            owner: '#f59e0b',
            admin: '#0ea5e9',
            kasir: '#10b981'
        };

        let html = `
            <div class="sidebar-brand">
                <div class="brand-icon">POS</div>
                <div class="brand-text">
                    <div data-store-name>TOKO SAYA</div>
                    <span class="role-badge" style="background:${roleColors[role] || '#666'}">${role.toUpperCase()}</span>
                </div>
            </div>
            <nav class="sidebar-nav">
        `;

        this.menuStructure.forEach(group => {
            // Cek apakah grup punya item yang boleh diakses
            const visibleItems = group.items.filter(item => access[item.id] !== false);
            if (visibleItems.length === 0) return;

            const isActiveGroup = visibleItems.some(item => item.id === currentPage);
            const groupId = `group-${group.id}`;

            html += `
                <div class="nav-group ${isActiveGroup ? 'open' : ''}">
                    <button class="nav-group-toggle" onclick="Sidebar.toggleGroup('${groupId}')">
                        <span class="nav-icon">${group.icon}</span>
                        <span class="nav-label">${group.label}</span>
                        <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="nav-group-menu" id="${groupId}" style="${isActiveGroup ? '' : 'display:none'}">
            `;

            visibleItems.forEach(item => {
                const active = item.id === currentPage ? 'active' : '';
                html += `<a href="${item.href}" class="nav-link ${active}">${item.label}</a>`;
            });

            html += `</div></div>`;
        });

        html += `
            </nav>
            <div class="sidebar-footer">
                <div class="user-mini">
                    <div class="user-name" data-user-name>-</div>
                    <div class="user-email">${Auth.getCurrentUser()?.email || '-'}</div>
                </div>
                <button class="btn-logout" onclick="Auth.logout()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Keluar
                </button>
            </div>
        `;

        container.innerHTML = html;
    },

    toggleGroup(id) {
        const menu = document.getElementById(id);
        const group = menu.closest('.nav-group');
        const isOpen = menu.style.display !== 'none';

        // Tutup semua grup lain (accordion style — opsional, bisa dihapus jika mau multi-open)
        // document.querySelectorAll('.nav-group-menu').forEach(m => { if(m.id !== id) m.style.display = 'none'; });
        // document.querySelectorAll('.nav-group').forEach(g => { if(!g.contains(menu)) g.classList.remove('open'); });

        if (isOpen) {
            menu.style.display = 'none';
            group.classList.remove('open');
        } else {
            menu.style.display = 'block';
            group.classList.add('open');
        }
    }
};

window.Sidebar = Sidebar;
