// Admin Dashboard - Main JavaScript
class AdminDashboard {
    constructor() {
        this.products = [];
        this.orders = [];
        this.currentUser = null;
        this.currentTab = 'orders';
        this.editingProduct = null;
        this.salesChart = null;

        // Admin user IDs - Replace with actual LINE user IDs of admin users
        // You can get user IDs from LINE Developers Console or by logging them in the console
        this.adminUserIds = [
            'admin_user_123', // Example: Replace with actual admin LINE user IDs
            // Add more admin user IDs as needed
            // Example: 'U1234567890abcdef1234567890abcdef'
        ];

        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Initialize LIFF
            await this.initializeLIFF();
            
            // Load data
            this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial content
            this.renderOrders();
            this.renderProducts();
            this.updateStatistics();
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
            this.showToast('เกิดข้อผิดพลาดในการโหลด Admin Dashboard', 'error');
            this.showLoading(false);
        }
    }

    async initializeLIFF() {
        return new Promise((resolve, reject) => {
            if (typeof liff === 'undefined') {
                // LIFF not available, use mock data for development
                this.currentUser = {
                    displayName: 'Admin User',
                    userId: 'admin_user_123',
                    pictureUrl: 'https://via.placeholder.com/50'
                };
                this.checkAdminAccess();
                resolve();
                return;
            }

            liff.init({ liffId: '2006986568-yjrOkKqm' }, () => {
                if (liff.isLoggedIn()) {
                    liff.getProfile().then(profile => {
                        this.currentUser = profile;
                        this.checkAdminAccess();
                        resolve();
                    }).catch(reject);
                } else {
                    liff.login();
                }
            }, reject);
        });
    }

    checkAdminAccess() {
        // Check if current user is admin
        if (!this.currentUser || !this.adminUserIds.includes(this.currentUser.userId)) {
            // User is not admin, show access denied
            this.showAccessDenied();
            return false;
        }

        // User is admin, proceed with initialization
        this.updateUserInfo();
        return true;
    }

    showAccessDenied() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <i class="fas fa-shield-alt" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.8;"></i>
                    <h1 style="margin: 0 0 10px 0; font-size: 2rem;">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p style="margin: 0 0 20px 0; opacity: 0.9;">คุณไม่มีสิทธิ์เข้าถึง Admin Dashboard</p>
                    <button onclick="window.location.href='index.html'" style="
                        background: #ff8c00;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#e67e00'" onmouseout="this.style.background='#ff8c00'">
                        <i class="fas fa-arrow-left"></i> กลับหน้าหลัก
                    </button>
                </div>
            </div>
        `;
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.displayName;
        }
    }

    loadData() {
        // Load products from localStorage
        const savedProducts = localStorage.getItem('liff_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        } else {
            // Load sample data if no saved data
            this.loadSampleProducts();
        }

        // Load orders from localStorage
        const savedOrders = localStorage.getItem('liff_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
    }

    loadSampleProducts() {
        this.products = [
            {
                id: 1,
                name: 'น้ำแข็ง เล็ก',
                description: 'น้ำแข็งก้อนเล็ก เหมาะสำหรับเครื่องดื่มเย็น',
                price: 40,
                icon: 'fas fa-snowflake',
                category: 'ice',
                stock: 100
            },
            {
                id: 2,
                name: 'น้ำแข็งใหญ่',
                description: 'น้ำแข็งก้อนใหญ่ เหมาะสำหรับเก็บอาหารและเครื่องดื่ม',
                price: 40,
                icon: 'fas fa-cube',
                category: 'ice',
                stock: 80
            },
            {
                id: 3,
                name: 'น้ำแข็งบด',
                description: 'น้ำแข็งบดละเอียด เหมาะสำหรับเครื่องดื่มเย็น',
                price: 40,
                icon: 'fas fa-icicles',
                category: 'ice',
                stock: 120
            },
            {
                id: 4,
                name: 'น้ำดื่ม 1 ลิตร',
                description: 'น้ำดื่มสะอาด บรรจุขวด 1 ลิตร',
                price: 15,
                icon: 'fas fa-tint',
                category: 'water',
                stock: 200
            },
            {
                id: 5,
                name: 'น้ำดื่ม 500 มล.',
                description: 'น้ำดื่มสะอาด บรรจุขวด 500 มิลลิลิตร',
                price: 10,
                icon: 'fas fa-wine-bottle',
                category: 'water',
                stock: 300
            },
            {
                id: 6,
                name: 'แก๊สหุงต้ม 15 กก.',
                description: 'แก๊สหุงต้มถัง 15 กิโลกรัม สำหรับครัวเรือน',
                price: 350,
                icon: 'fas fa-fire',
                category: 'gas',
                stock: 50
            },
            {
                id: 7,
                name: 'แก๊สหุงต้ม 12 กก.',
                description: 'แก๊สหุงต้มถัง 12 กิโลกรัม ขนาดเล็ก',
                price: 280,
                icon: 'fas fa-fire-flame-simple',
                category: 'gas',
                stock: 30
            }
        ];
        this.saveProducts();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Order filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderOrders();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.renderOrders();
        });

        document.getElementById('refreshOrders').addEventListener('click', () => {
            this.renderOrders();
            this.showToast('รีเฟรชข้อมูลแล้ว');
        });

        // Admin modal controls
        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.closeAdminModal();
        });

        document.getElementById('cancelProductBtn').addEventListener('click', () => {
            this.closeAdminModal();
        });

        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.openAdminModal();
        });

        document.getElementById('adminProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        document.getElementById('productIcon').addEventListener('change', (e) => {
            this.previewIcon(e);
        });

        // Product search and filter
        document.getElementById('productSearch').addEventListener('input', () => {
            this.filterProducts();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterProducts();
        });

        document.getElementById('stockFilter').addEventListener('change', () => {
            this.filterProducts();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            document.getElementById('productSearch').value = '';
            document.getElementById('categoryFilter').value = 'all';
            document.getElementById('stockFilter').value = 'all';
            this.filterProducts();
        });

        // Close admin modal when clicking outside
        document.getElementById('adminProductModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminProductModal') {
                this.closeAdminModal();
            }
        });

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // Here you could implement different chart periods
                // For now, just re-render the current chart
                this.renderSalesChart();
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Update content based on tab
        if (tabName === 'orders') {
            this.renderOrders();
        } else if (tabName === 'products') {
            this.renderProducts();
        } else if (tabName === 'statistics') {
            this.updateStatistics();
            this.renderSalesChart();
            this.renderStatusChart();
            this.renderRecentActivity();
        }
    }

    renderOrders() {
        const ordersManagement = document.getElementById('ordersManagement');
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let filteredOrders = [...this.orders];

        // Filter by status
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        // Filter by date
        if (dateFilter) {
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.date).toDateString();
                const filterDate = new Date(dateFilter).toDateString();
                return orderDate === filterDate;
            });
        }

        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredOrders.length === 0) {
            ordersManagement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>ไม่มีคำสั่งซื้อ</h3>
                    <p>ยังไม่มีคำสั่งซื้อในระบบ หรือลองเปลี่ยนตัวกรอง</p>
                </div>
            `;
            return;
        }

        // Create summary stats
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

        ordersManagement.innerHTML = `
            <div class="orders-summary">
                <div class="summary-stat">
                    <div class="stat-value">${filteredOrders.length}</div>
                    <div class="stat-label">คำสั่งซื้อ</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">฿${totalRevenue.toLocaleString()}</div>
                    <div class="stat-label">ยอดรวม</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">฿${avgOrderValue.toLocaleString()}</div>
                    <div class="stat-label">เฉลี่ย/คำสั่งซื้อ</div>
                </div>
            </div>

            <div class="orders-list">
                ${filteredOrders.map(order => `
                    <div class="order-card ${order.status}">
                        <div class="order-header">
                            <div class="order-primary-info">
                                <div class="order-id">#${order.id}</div>
                                <div class="order-status-badge ${order.status}">
                                    <i class="${this.getStatusIcon(order.status)}"></i>
                                    ${this.getStatusText(order.status)}
                                </div>
                            </div>
                            <div class="order-meta">
                                <div class="order-date">
                                    <i class="fas fa-calendar"></i>
                                    ${this.formatDate(order.date)}
                                </div>
                                <div class="order-total">
                                    <i class="fas fa-money-bill-wave"></i>
                                    ฿${order.total}
                                </div>
                            </div>
                        </div>

                        ${order.deliveryInfo ? `
                            <div class="order-customer-info">
                                <div class="customer-detail">
                                    <i class="fas fa-user"></i>
                                    <span>${order.deliveryInfo.customerName}</span>
                                </div>
                                <div class="customer-detail">
                                    <i class="fas fa-phone"></i>
                                    <span>${order.deliveryInfo.customerPhone}</span>
                                </div>
                                <div class="customer-detail address">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${order.deliveryInfo.deliveryAddress}</span>
                                </div>
                                ${order.deliveryInfo.deliveryNote ? `
                                    <div class="customer-detail note">
                                        <i class="fas fa-sticky-note"></i>
                                        <span>${order.deliveryInfo.deliveryNote}</span>
                                    </div>
                                ` : ''}
                                <div class="customer-detail">
                                    <i class="fas fa-credit-card"></i>
                                    <span>${this.getPaymentMethodText(order.paymentMethod || 'cash')}</span>
                                </div>
                            </div>
                        ` : ''}

                        <div class="order-items-summary">
                            <div class="items-count">
                                <i class="fas fa-shopping-bag"></i>
                                ${order.items.length} รายการ
                            </div>
                            <div class="items-preview">
                                ${order.items.slice(0, 3).map(item => `
                                    <span class="item-tag">${item.name} x${item.quantity}</span>
                                `).join('')}
                                ${order.items.length > 3 ? `<span class="item-more">+${order.items.length - 3} รายการ</span>` : ''}
                            </div>
                        </div>

                        <div class="order-actions">
                            <div class="action-buttons">
                                ${this.getOrderActions(order)}
                            </div>
                            <button class="view-details-btn" onclick="admin.viewOrderDetails(${order.id})">
                                <i class="fas fa-eye"></i> ดูรายละเอียด
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getOrderActions(order) {
        switch (order.status) {
            case 'pending':
                return `
                    <button class="action-btn confirm-btn" onclick="admin.confirmOrder(${order.id})">
                        <i class="fas fa-check"></i> ยืนยัน
                    </button>
                    <button class="action-btn cancel-btn" onclick="admin.updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fas fa-times"></i> ยกเลิก
                    </button>
                `;
            case 'confirmed':
                return `
                    <button class="action-btn preparing-btn" onclick="admin.updateOrderStatus(${order.id}, 'preparing')">
                        <i class="fas fa-clock"></i> เตรียมสินค้า
                    </button>
                `;
            case 'preparing':
                return `
                    <button class="action-btn ready-btn" onclick="admin.updateOrderStatus(${order.id}, 'ready')">
                        <i class="fas fa-check-circle"></i> พร้อมรับ
                    </button>
                `;
            case 'ready':
                return `
                    <button class="action-btn complete-btn" onclick="admin.updateOrderStatus(${order.id}, 'completed')">
                        <i class="fas fa-check-double"></i> เสร็จสิ้น
                    </button>
                `;
            case 'completed':
                return `
                    <span class="status-completed">
                        <i class="fas fa-check-circle"></i> เสร็จสิ้นแล้ว
                    </span>
                `;
            case 'cancelled':
                return `
                    <span class="status-cancelled">
                        <i class="fas fa-times-circle"></i> ยกเลิกแล้ว
                    </span>
                `;
            default:
                return '';
        }
    }

    getStatusIcon(status) {
        const icons = {
            'pending': 'fas fa-clock',
            'confirmed': 'fas fa-check',
            'preparing': 'fas fa-cog',
            'ready': 'fas fa-check-circle',
            'completed': 'fas fa-check-double',
            'cancelled': 'fas fa-times'
        };
        return icons[status] || 'fas fa-question';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'วันนี้';
        } else if (diffDays === 2) {
            return 'เมื่อวาน';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} วันที่แล้ว`;
        } else {
            return date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const detailModal = document.createElement('div');
        detailModal.className = 'modal';
        detailModal.id = 'orderDetailModal';
        detailModal.innerHTML = `
            <div class="modal-content order-detail-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-receipt"></i> รายละเอียดคำสั่งซื้อ #${order.id}</h3>
                    <span class="close" onclick="document.getElementById('orderDetailModal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-detail-content">
                        <div class="detail-section">
                            <h4><i class="fas fa-info-circle"></i> ข้อมูลคำสั่งซื้อ</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <span class="label">หมายเลขคำสั่งซื้อ:</span>
                                    <span class="value">#${order.id}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">วันที่สั่งซื้อ:</span>
                                    <span class="value">${order.date}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">สถานะ:</span>
                                    <span class="value status-${order.status}">${this.getStatusText(order.status)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">วิธีการชำระเงิน:</span>
                                    <span class="value">${this.getPaymentMethodText(order.paymentMethod || 'cash')}</span>
                                </div>
                            </div>
                        </div>

                        ${order.deliveryInfo ? `
                            <div class="detail-section">
                                <h4><i class="fas fa-user"></i> ข้อมูลลูกค้า</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span class="label">ชื่อ:</span>
                                        <span class="value">${order.deliveryInfo.customerName}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">เบอร์โทร:</span>
                                        <span class="value">${order.deliveryInfo.customerPhone}</span>
                                    </div>
                                    <div class="detail-item full-width">
                                        <span class="label">ที่อยู่:</span>
                                        <span class="value">${order.deliveryInfo.deliveryAddress}</span>
                                    </div>
                                    ${order.deliveryInfo.deliveryNote ? `
                                        <div class="detail-item full-width">
                                            <span class="label">หมายเหตุ:</span>
                                            <span class="value">${order.deliveryInfo.deliveryNote}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <div class="detail-section">
                            <h4><i class="fas fa-shopping-cart"></i> รายการสินค้า</h4>
                            <div class="order-items-detail">
                                ${order.items.map(item => `
                                    <div class="order-item-detail-row">
                                        <div class="item-info">
                                            <div class="item-name">${item.name}</div>
                                            <div class="item-description">${item.description}</div>
                                        </div>
                                        <div class="item-quantity">x${item.quantity}</div>
                                        <div class="item-price">฿${item.price * item.quantity}</div>
                                    </div>
                                `).join('')}
                                <div class="order-total-row">
                                    <div class="total-label">รวมทั้งสิ้น</div>
                                    <div class="total-amount">฿${order.total}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailModal);
        detailModal.style.display = 'block';
    }

    renderProducts() {
        const productsManagement = document.getElementById('productsManagement');

        if (this.products.length === 0) {
            productsManagement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h3>ยังไม่มีสินค้า</h3>
                    <p>เพิ่มสินค้าใหม่เพื่อเริ่มขาย</p>
                    <button class="add-first-product-btn" onclick="document.getElementById('addProductBtn').click()">
                        <i class="fas fa-plus"></i> เพิ่มสินค้าแรก
                    </button>
                </div>
            `;
            return;
        }

        // Create table header with sorting
        const tableHTML = `
            <div class="products-table-container">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-sort="name">
                                <span>สินค้า</span>
                                <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="category">
                                <span>หมวดหมู่</span>
                                <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="price">
                                <span>ราคา</span>
                                <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="stock">
                                <span>สต็อก</span>
                                <i class="fas fa-sort"></i>
                            </th>
                            <th>สถานะ</th>
                            <th>การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.products.map(product => `
                            <tr class="product-row" data-category="${product.category}" data-stock="${product.stock}">
                                <td class="product-info-cell">
                                    <div class="product-info">
                                        <div class="product-icon">
                                            <i class="${product.icon}"></i>
                                        </div>
                                        <div class="product-details">
                                            <div class="product-name">${product.name}</div>
                                            <div class="product-description">${product.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="category-badge category-${product.category}">
                                        ${this.getCategoryText(product.category)}
                                    </span>
                                </td>
                                <td>
                                    <span class="price">฿${product.price}</span>
                                </td>
                                <td>
                                    <span class="stock ${product.stock < 10 ? 'low-stock' : ''}">
                                        ${product.stock} ชิ้น
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${product.stock > 0 ? 'active' : 'inactive'}">
                                        ${product.stock > 0 ? 'พร้อมขาย' : 'สินค้าหมด'}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit-btn" onclick="admin.editProduct(${product.id})" title="แก้ไข">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn delete-btn" onclick="admin.deleteProduct(${product.id})" title="ลบ">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <button class="action-btn view-btn" onclick="admin.viewProduct(${product.id})" title="ดูรายละเอียด">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        productsManagement.innerHTML = tableHTML;

        // Add sorting functionality
        this.setupTableSorting();

        // Apply initial filters
        this.filterProducts();
    }

    setupTableSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');

        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                const currentSort = header.dataset.sortOrder || 'asc';
                const newSort = currentSort === 'asc' ? 'desc' : 'asc';

                // Reset all sort indicators
                sortableHeaders.forEach(h => {
                    h.dataset.sortOrder = '';
                    h.querySelector('i').className = 'fas fa-sort';
                });

                // Set new sort
                header.dataset.sortOrder = newSort;
                header.querySelector('i').className = newSort === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';

                this.sortProducts(sortBy, newSort);
                this.renderProducts();
            });
        });
    }

    sortProducts(sortBy, order) {
        this.products.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'category':
                    aValue = this.getCategoryText(a.category);
                    bValue = this.getCategoryText(b.category);
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'stock':
                    aValue = a.stock;
                    bValue = b.stock;
                    break;
                default:
                    return 0;
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }

    filterProducts() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const stockFilter = document.getElementById('stockFilter').value;

        const rows = document.querySelectorAll('.product-row');

        rows.forEach(row => {
            const productName = row.querySelector('.product-name').textContent.toLowerCase();
            const productDescription = row.querySelector('.product-description').textContent.toLowerCase();
            const category = row.dataset.category;
            const stock = parseInt(row.dataset.stock);

            let show = true;

            // Search filter
            if (searchTerm && !productName.includes(searchTerm) && !productDescription.includes(searchTerm)) {
                show = false;
            }

            // Category filter
            if (categoryFilter !== 'all' && category !== categoryFilter) {
                show = false;
            }

            // Stock filter
            if (stockFilter === 'low' && stock >= 10) {
                show = false;
            } else if (stockFilter === 'out' && stock > 0) {
                show = false;
            }

            row.style.display = show ? '' : 'none';
        });

        this.updateFilterSummary();
    }

    updateFilterSummary() {
        const visibleRows = document.querySelectorAll('.product-row:not([style*="display: none"])');
        const totalRows = document.querySelectorAll('.product-row').length;

        const summaryElement = document.getElementById('filterSummary');
        if (summaryElement) {
            summaryElement.textContent = `แสดง ${visibleRows.length} จาก ${totalRows} รายการ`;
        }
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create a simple view modal
        const viewModal = document.createElement('div');
        viewModal.className = 'modal';
        viewModal.id = 'viewProductModal';
        viewModal.innerHTML = `
            <div class="modal-content view-modal">
                <span class="close" onclick="document.getElementById('viewProductModal').remove()">&times;</span>
                <div class="modal-body">
                    <h3>รายละเอียดสินค้า</h3>
                    <div class="product-detail-view">
                        <div class="product-detail-header">
                            <div class="product-icon-large">
                                <i class="${product.icon}"></i>
                            </div>
                            <div class="product-basic-info">
                                <h4>${product.name}</h4>
                                <div class="price-large">฿${product.price}</div>
                                <span class="category-badge category-${product.category}">
                                    ${this.getCategoryText(product.category)}
                                </span>
                            </div>
                        </div>
                        <div class="product-detail-content">
                            <div class="detail-section">
                                <h5>คำอธิบาย</h5>
                                <p>${product.description}</p>
                            </div>
                            <div class="detail-section">
                                <h5>ข้อมูลสินค้า</h5>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span class="detail-label">ราคา:</span>
                                        <span class="detail-value">฿${product.price}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">สต็อก:</span>
                                        <span class="detail-value ${product.stock < 10 ? 'low-stock' : ''}">${product.stock} ชิ้น</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">หมวดหมู่:</span>
                                        <span class="detail-value">${this.getCategoryText(product.category)}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">ไอคอน:</span>
                                        <span class="detail-value"><i class="${product.icon}"></i> ${product.icon}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="product-detail-actions">
                            <button class="edit-btn" onclick="admin.editProduct(${product.id}); document.getElementById('viewProductModal').remove();">
                                <i class="fas fa-edit"></i> แก้ไขสินค้า
                            </button>
                            <button class="delete-btn" onclick="admin.deleteProduct(${product.id}); document.getElementById('viewProductModal').remove();">
                                <i class="fas fa-trash"></i> ลบสินค้า
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(viewModal);
        viewModal.style.display = 'block';
    }

    updateStatistics() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;
        const cancelledOrders = this.orders.filter(order => order.status === 'cancelled').length;

        // Calculate additional metrics
        const todayOrders = this.orders.filter(order => {
            const orderDate = new Date(order.date).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        });

        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

        // Update main stats
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = `฿${totalRevenue.toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('completedOrders').textContent = completedOrders;

        // Update additional stats if elements exist
        const todayOrdersEl = document.getElementById('todayOrders');
        const todayRevenueEl = document.getElementById('todayRevenue');
        const avgOrderValueEl = document.getElementById('avgOrderValue');
        const completionRateEl = document.getElementById('completionRate');
        const cancelledOrdersEl = document.getElementById('cancelledOrders');

        if (todayOrdersEl) todayOrdersEl.textContent = todayOrders.length;
        if (todayRevenueEl) todayRevenueEl.textContent = `฿${todayRevenue.toLocaleString()}`;
        if (avgOrderValueEl) avgOrderValueEl.textContent = `฿${avgOrderValue.toLocaleString()}`;
        if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
        if (cancelledOrdersEl) cancelledOrdersEl.textContent = cancelledOrders;
    }

    renderSalesChart() {
        const ctx = document.getElementById('salesChart').getContext('2d');

        // Destroy existing chart
        if (this.salesChart) {
            this.salesChart.destroy();
        }

        // Get last 7 days data
        const last7Days = this.getLast7DaysData();

        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.labels,
                datasets: [{
                    label: 'ยอดขาย (บาท)',
                    data: last7Days.data,
                    borderColor: '#ff8c00',
                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ff8c00',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'ยอดขาย: ฿' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '฿' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');

        // Destroy existing chart
        if (this.statusChart) {
            this.statusChart.destroy();
        }

        // Count orders by status
        const statusCounts = {
            pending: this.orders.filter(o => o.status === 'pending').length,
            confirmed: this.orders.filter(o => o.status === 'confirmed').length,
            preparing: this.orders.filter(o => o.status === 'preparing').length,
            ready: this.orders.filter(o => o.status === 'ready').length,
            completed: this.orders.filter(o => o.status === 'completed').length,
            cancelled: this.orders.filter(o => o.status === 'cancelled').length
        };

        const statusLabels = {
            pending: 'รอดำเนินการ',
            confirmed: 'ยืนยันแล้ว',
            preparing: 'กำลังเตรียม',
            ready: 'พร้อมรับ',
            completed: 'เสร็จสิ้น',
            cancelled: 'ยกเลิก'
        };

        const statusColors = {
            pending: '#ffc107',
            confirmed: '#17a2b8',
            preparing: '#6f42c1',
            ready: '#28a745',
            completed: '#20c997',
            cancelled: '#dc3545'
        };

        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts).map(key => statusLabels[key]),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: Object.keys(statusCounts).map(key => statusColors[key]),
                    borderColor: Object.keys(statusCounts).map(key => statusColors[key]),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} รายการ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        // Get recent orders (last 10)
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentOrders.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-inbox"></i>
                    <p>ยังไม่มีกิจกรรม</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentOrders.map(order => `
            <div class="activity-item">
                <div class="activity-icon ${order.status}">
                    <i class="${this.getStatusIcon(order.status)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">
                        คำสั่งซื้อ #${order.id}
                        <span class="activity-amount">฿${order.total}</span>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-time">${this.formatDate(order.date)}</span>
                        <span class="activity-status ${order.status}">${this.getStatusText(order.status)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getLast7DaysData() {
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }));
            
            const dayOrders = this.orders.filter(order => {
                const orderDate = new Date(order.date).toISOString().split('T')[0];
                return orderDate === dateStr;
            });
            
            const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
            data.push(dayRevenue);
        }
        
        return { labels, data };
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'รอดำเนินการ',
            'confirmed': 'ยืนยันแล้ว',
            'preparing': 'กำลังเตรียม',
            'ready': 'พร้อมรับ',
            'completed': 'เสร็จสิ้น',
            'cancelled': 'ยกเลิก'
        };
        return statusMap[status] || status;
    }

    getCategoryText(category) {
        const categoryMap = {
            'ice': 'น้ำแข็ง',
            'water': 'น้ำดื่ม',
            'gas': 'แก๊สหุงต้ม'
        };
        return categoryMap[category] || category;
    }

    // Order Management Functions
    confirmOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'confirmed';
            this.saveOrders();
            this.renderOrders();
            this.updateStatistics();
            this.showToast(`ยืนยันคำสั่งซื้อ #${orderId} แล้ว`);
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders();
            this.renderOrders();
            this.updateStatistics();
            this.showToast(`อัปเดตสถานะคำสั่งซื้อ #${orderId} เป็น ${this.getStatusText(newStatus)}`);
        }
    }

    // Product Management Functions
    openAdminModal(productId = null) {
        this.editingProduct = productId;
        const modal = document.getElementById('adminProductModal');
        const title = document.getElementById('adminModalTitle');
        const form = document.getElementById('adminProductForm');
        const formStatus = document.getElementById('formStatus');

        // Clear previous status
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = '';
        }

        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                title.innerHTML = '<i class="fas fa-edit"></i> แก้ไขสินค้า';
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productIcon').value = product.icon;

                // Update icon preview
                const previewImg = document.getElementById('previewImg');
                previewImg.innerHTML = `<i class="${product.icon}"></i>`;
                previewImg.className = 'product-icon-preview active';
            }
        } else {
            title.innerHTML = '<i class="fas fa-plus-circle"></i> เพิ่มสินค้าใหม่';
            form.reset();

            // Reset icon preview
            const previewImg = document.getElementById('previewImg');
            previewImg.innerHTML = `<i class="fas fa-question-circle"></i>`;
            previewImg.className = 'product-icon-preview';
        }

        modal.style.display = 'block';

        // Focus on first input
        setTimeout(() => {
            document.getElementById('productName').focus();
        }, 100);
    }

    closeAdminModal() {
        const modal = document.getElementById('adminProductModal');
        const form = document.getElementById('adminProductForm');
        const formStatus = document.getElementById('formStatus');

        modal.style.display = 'none';
        this.editingProduct = null;

        // Reset form
        form.reset();

        // Clear form status
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = '';
        }

        // Reset icon preview
        const previewImg = document.getElementById('previewImg');
        if (previewImg) {
            previewImg.innerHTML = `<i class="fas fa-question-circle"></i>`;
            previewImg.className = 'product-icon-preview';
        }
    }

    previewIcon(event) {
        const selectedIcon = event.target.value;
        const previewImg = document.getElementById('previewImg');

        if (selectedIcon) {
            previewImg.innerHTML = `<i class="${selectedIcon}"></i>`;
            previewImg.className = 'product-icon-preview active';
        } else {
            previewImg.innerHTML = `<i class="fas fa-question-circle"></i>`;
            previewImg.className = 'product-icon-preview';
        }
    }

    saveProduct() {
        const form = document.getElementById('adminProductForm');
        const formStatus = document.getElementById('formStatus');

        // Clear previous status
        formStatus.textContent = '';
        formStatus.className = '';

        // Validate form
        if (!this.validateProductForm()) {
            return;
        }

        const formData = new FormData(form);

        const productData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseInt(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: formData.get('category'),
            icon: document.getElementById('productIcon').value || 'fas fa-box'
        };

        try {
            if (this.editingProduct) {
                // Edit product
                const productIndex = this.products.findIndex(p => p.id === this.editingProduct);
                if (productIndex !== -1) {
                    this.products[productIndex] = {
                        ...this.products[productIndex],
                        ...productData
                    };
                    formStatus.textContent = '✅ แก้ไขสินค้าสำเร็จ!';
                    formStatus.className = 'success';
                    this.showToast('แก้ไขสินค้าสำเร็จ!');
                }
            } else {
                // Add new product
                const newProduct = {
                    id: Date.now(),
                    ...productData
                };
                this.products.push(newProduct);
                formStatus.textContent = '✅ เพิ่มสินค้าสำเร็จ!';
                formStatus.className = 'success';
                this.showToast('เพิ่มสินค้าสำเร็จ!');
            }

            this.saveProducts();
            this.renderProducts();

            // Close modal after short delay to show success message
            setTimeout(() => {
                this.closeAdminModal();
            }, 1500);

        } catch (error) {
            console.error('Error saving product:', error);
            formStatus.textContent = '❌ เกิดข้อผิดพลาดในการบันทึก';
            formStatus.className = 'error';
            this.showToast('เกิดข้อผิดพลาดในการบันทึกสินค้า', 'error');
        }
    }

    validateProductForm() {
        const formStatus = document.getElementById('formStatus');
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category = document.getElementById('productCategory').value;
        const icon = document.getElementById('productIcon').value;

        // Validate name
        if (!name) {
            formStatus.textContent = '❌ กรุณากรอกชื่อสินค้า';
            formStatus.className = 'error';
            document.getElementById('productName').focus();
            return false;
        }

        if (name.length < 2) {
            formStatus.textContent = '❌ ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร';
            formStatus.className = 'error';
            document.getElementById('productName').focus();
            return false;
        }

        // Validate description
        if (!description) {
            formStatus.textContent = '❌ กรุณากรอกรายละเอียดสินค้า';
            formStatus.className = 'error';
            document.getElementById('productDescription').focus();
            return false;
        }

        // Validate price
        if (isNaN(price) || price < 0) {
            formStatus.textContent = '❌ กรุณากรอกราคาที่ถูกต้อง';
            formStatus.className = 'error';
            document.getElementById('productPrice').focus();
            return false;
        }

        // Validate stock
        if (isNaN(stock) || stock < 0) {
            formStatus.textContent = '❌ กรุณากรอกจำนวนสต็อกที่ถูกต้อง';
            formStatus.className = 'error';
            document.getElementById('productStock').focus();
            return false;
        }

        // Validate category
        if (!category) {
            formStatus.textContent = '❌ กรุณาเลือกหมวดหมู่สินค้า';
            formStatus.className = 'error';
            document.getElementById('productCategory').focus();
            return false;
        }

        // Validate icon
        if (!icon) {
            formStatus.textContent = '❌ กรุณาเลือกไอคอนสินค้า';
            formStatus.className = 'error';
            document.getElementById('productIcon').focus();
            return false;
        }

        return true;
    }

    editProduct(productId) {
        this.openAdminModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderProducts();
            this.showToast('ลบสินค้าสำเร็จ!');
        }
    }

    // Data Management Functions
    saveProducts() {
        localStorage.setItem('liff_products', JSON.stringify(this.products));
    }

    saveOrders() {
        localStorage.setItem('liff_orders', JSON.stringify(this.orders));
    }

    // UI Functions
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminDashboard();
});
