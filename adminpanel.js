class AdminPanel {
    constructor() {
        this.orders = [];
        this.products = [];
        this.isLoggedIn = false;
        this.editingProductId = null;
        this.currentTab = 'orders';
        this.init();
    }

    init() {
        this.loadOrders();
        this.loadProducts();
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Filters
        const orderStatusFilter = document.getElementById('orderStatusFilter');
        const paymentMethodFilter = document.getElementById('paymentMethodFilter');
        const refreshOrders = document.getElementById('refreshOrders');
        
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', () => this.renderAdminOrders());
        }
        if (paymentMethodFilter) {
            paymentMethodFilter.addEventListener('change', () => this.renderAdminOrders());
        }
        if (refreshOrders) {
            refreshOrders.addEventListener('click', () => {
                this.loadOrders();
                this.renderAdminOrders();
            });
        }

        // Product Management
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openProductModal());
        }

        const closeProductModal = document.getElementById('closeProductModal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => this.closeProductModal());
        }

        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => this.closeProductModal());
        }

        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Close modal when clicking outside
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target.id === 'productModal') {
                    this.closeProductModal();
                }
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'admin123') {
            this.isLoggedIn = true;
            localStorage.setItem('adminLoggedIn', 'true');
            this.showAdminPanel();
            errorMessage.style.display = 'none';
        } else {
            errorMessage.style.display = 'block';
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        this.showLoginForm();
    }

    checkLoginStatus() {
        const loggedIn = localStorage.getItem('adminLoggedIn');
        if (loggedIn === 'true') {
            this.isLoggedIn = true;
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        this.switchTab('orders');
    }

    loadOrders() {
        const savedOrders = localStorage.getItem('liff_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            this.orders = [];
        }
    }

    loadProducts() {
        // Load from localStorage or use sample data from main app
        const savedProducts = localStorage.getItem('liff_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        } else {
            // Initialize with default products
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
    }

    saveProducts() {
        localStorage.setItem('liff_products', JSON.stringify(this.products));
        // Also update the main app's localStorage
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: this.products }));
    }

    renderAdminOrders() {
        const adminOrdersList = document.getElementById('adminOrdersList');
        if (!adminOrdersList) return;

        const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
        const paymentFilter = document.getElementById('paymentMethodFilter')?.value || 'all';

        let filteredOrders = [...this.orders];

        // Filter by status
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        // Filter by payment method
        if (paymentFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.paymentMethod === paymentFilter);
        }

        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredOrders.length === 0) {
            adminOrdersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>ไม่มีคำสั่งซื้อ</h3>
                    <p>ยังไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไขที่เลือก</p>
                </div>
            `;
            return;
        }

        adminOrdersList.innerHTML = filteredOrders.map(order => `
            <div class="admin-order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h4>คำสั่งซื้อ #${order.id}</h4>
                        <p class="order-date">${order.date}</p>
                    </div>
                    <div class="order-status">
                        <select class="status-select" onchange="adminPanel.updateOrderStatus('${order.id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>รอตรวจสอบ</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>ยืนยันแล้ว</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>เสร็จสิ้น</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
                        </select>
                    </div>
                </div>
                
                <div class="order-customer">
                    <h5><i class="fas fa-user"></i> ข้อมูลลูกค้า</h5>
                    <p><strong>ชื่อ:</strong> ${order.customer.customerName}</p>
                    <p><strong>เบอร์:</strong> ${order.customer.customerPhone}</p>
                    <p><strong>ที่อยู่:</strong> ${order.customer.deliveryAddress}</p>
                    ${order.customer.deliveryNote ? `<p><strong>หมายเหตุ:</strong> ${order.customer.deliveryNote}</p>` : ''}
                </div>
                
                <div class="order-items">
                    <h5><i class="fas fa-shopping-bag"></i> รายการสินค้า</h5>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>฿${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                    <div class="order-total">
                        <strong>รวม: ฿${order.total}</strong>
                    </div>
                </div>
                
                <div class="order-payment">
                    <h5><i class="fas fa-credit-card"></i> การชำระเงิน</h5>
                    <p><strong>วิธีชำระ:</strong> ${this.getPaymentMethodName(order.paymentMethod)}</p>
                    ${this.renderPaymentSlip(order)}
                </div>
                
                <div class="order-actions">
                    <button class="btn-view" onclick="adminPanel.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> ดูรายละเอียด
                    </button>
                    <button class="btn-print" onclick="adminPanel.printOrder('${order.id}')">
                        <i class="fas fa-print"></i> พิมพ์
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPaymentSlip(order) {
        if (order.paymentMethod === 'cash') {
            return '<p>ชำระเป็นเงินสดกับผู้ส่ง</p>';
        }
        
        // Check if order has payment slip data
        if (order.paymentSlip) {
            return `
                <div class="payment-slip">
                    <p><strong>สลิปการชำระเงิน:</strong></p>
                    <img src="${order.paymentSlip}" alt="สลิปการชำระเงิน" class="slip-image" onclick="adminPanel.viewSlipFullscreen('${order.paymentSlip}')">
                    <div class="slip-actions">
                        <button class="btn-verify" onclick="adminPanel.verifyPayment('${order.id}')">
                            <i class="fas fa-check"></i> ยืนยันการชำระ
                        </button>
                        <button class="btn-reject" onclick="adminPanel.rejectPayment('${order.id}')">
                            <i class="fas fa-times"></i> ปฏิเสธ
                        </button>
                    </div>
                </div>
            `;
        }
        
        return '<p class="no-slip">ยังไม่ได้อัปโหลดสลิป</p>';
    }

    getPaymentMethodName(method) {
        switch(method) {
            case 'cash': return 'เงินสด';
            case 'transfer': return 'โอนเงิน';
            case 'promptpay': return 'PromptPay';
            default: return method;
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            localStorage.setItem('liff_orders', JSON.stringify(this.orders));
            this.showToast(`อัปเดตสถานะคำสั่งซื้อ #${orderId} เป็น ${this.getStatusName(newStatus)} แล้ว`, 'success');
        }
    }

    getStatusName(status) {
        switch(status) {
            case 'pending': return 'รอตรวจสอบ';
            case 'confirmed': return 'ยืนยันแล้ว';
            case 'completed': return 'เสร็จสิ้น';
            case 'cancelled': return 'ยกเลิก';
            default: return status;
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`รายละเอียดคำสั่งซื้อ #${orderId}\n\nลูกค้า: ${order.customer.customerName}\nยอดรวม: ฿${order.total}\nสถานะ: ${this.getStatusName(order.status)}`);
        }
    }

    printOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(this.generateReceiptHTML(order));
            printWindow.document.close();
            printWindow.print();
        }
    }

    generateReceiptHTML(order) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>ใบเสร็จ #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt { max-width: 400px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .section { margin: 15px 0; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { border-top: 1px solid #333; padding-top: 10px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>ใบเสร็จรับเงิน</h2>
                        <p>เลขที่: ${order.id}</p>
                        <p>วันที่: ${order.date}</p>
                    </div>
                    
                    <div class="section">
                        <h3>ข้อมูลลูกค้า</h3>
                        <p>ชื่อ: ${order.customer.customerName}</p>
                        <p>เบอร์โทร: ${order.customer.customerPhone}</p>
                        <p>ที่อยู่: ${order.customer.deliveryAddress}</p>
                    </div>
                    
                    <div class="section">
                        <h3>รายการสินค้า</h3>
                        ${order.items.map(item => `
                            <div class="item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>฿${item.price * item.quantity}</span>
                            </div>
                        `).join('')}
                        <div class="total">
                            <div class="item">
                                <span>ยอดรวมทั้งหมด</span>
                                <span>฿${order.total}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <p>วิธีชำระเงิน: ${this.getPaymentMethodName(order.paymentMethod)}</p>
                        <p style="text-align: center; margin-top: 20px;">ขอบคุณที่ใช้บริการ</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    verifyPayment(orderId) {
        this.updateOrderStatus(orderId, 'confirmed');
        this.renderAdminOrders();
    }

    rejectPayment(orderId) {
        this.updateOrderStatus(orderId, 'cancelled');
        this.renderAdminOrders();
    }

    viewSlipFullscreen(slipUrl) {
        const modal = document.createElement('div');
        modal.className = 'slip-modal';
        modal.innerHTML = `
            <div class="slip-modal-content">
                <span class="slip-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <img src="${slipUrl}" alt="สลิปการชำระเงิน">
            </div>
        `;
        document.body.appendChild(modal);
    }

    showToast(message, type = 'success') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Tab Switching
    switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show corresponding content
        const contentMap = {
            'orders': 'ordersTab',
            'products': 'productsTab',
            'stats': 'stats',
            'github': 'github'
        };

        const contentId = contentMap[tabName];
        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabName;

        // Load content based on tab
        if (tabName === 'orders') {
            this.renderAdminOrders();
        } else if (tabName === 'products') {
            this.renderProducts();
        } else if (tabName === 'stats') {
            this.updateStats();
        }
    }

    // Product Management Functions
    renderProducts() {
        const productsManagement = document.getElementById('productsManagement');
        if (!productsManagement) return;

        if (this.products.length === 0) {
            productsManagement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>ไม่มีสินค้า</h3>
                    <p>เริ่มต้นโดยการเพิ่มสินค้าใหม่</p>
                </div>
            `;
            return;
        }

        productsManagement.innerHTML = this.products.map(product => `
            <div class="product-manage-card">
                <div class="product-manage-icon">
                    <i class="${product.icon}"></i>
                </div>
                <div class="product-manage-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                </div>
                <div class="product-manage-details">
                    <div class="product-detail-row">
                        <span class="product-detail-label">ราคา:</span>
                        <span class="product-detail-value product-price">฿${product.price}</span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">สต็อก:</span>
                        <span class="product-detail-value ${this.getStockClass(product.stock)}">${product.stock} ชิ้น</span>
                    </div>
                    <div class="product-detail-row">
                        <span class="product-detail-label">หมวดหมู่:</span>
                        <span class="category-badge category-${product.category}">${this.getCategoryName(product.category)}</span>
                    </div>
                </div>
                <div class="product-manage-actions">
                    <button class="btn btn-warning" onclick="adminPanel.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> แก้ไข
                    </button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStockClass(stock) {
        if (stock < 20) return 'stock-low';
        if (stock < 50) return 'stock-medium';
        return 'stock-high';
    }

    getCategoryName(category) {
        const names = {
            'ice': 'น้ำแข็ง',
            'water': 'น้ำดื่ม',
            'gas': 'แก๊ส',
            'other': 'อื่นๆ'
        };
        return names[category] || category;
    }

    openProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');
        
        if (!modal || !modalTitle || !form) return;

        // Reset form
        form.reset();
        this.editingProductId = null;

        if (productId) {
            // Edit mode
            const product = this.products.find(p => p.id === productId);
            if (product) {
                modalTitle.textContent = 'แก้ไขสินค้า';
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productIcon').value = product.icon;
                this.editingProductId = productId;
            }
        } else {
            // Add mode
            modalTitle.textContent = 'เพิ่มสินค้าใหม่';
        }

        modal.style.display = 'block';
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingProductId = null;
    }

    saveProduct() {
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category = document.getElementById('productCategory').value;
        const icon = document.getElementById('productIcon').value || 'fas fa-box';

        if (this.editingProductId) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === this.editingProductId);
            if (index !== -1) {
                this.products[index] = {
                    ...this.products[index],
                    name,
                    description,
                    price,
                    stock,
                    category,
                    icon
                };
                this.showToast('อัปเดตสินค้าสำเร็จ', 'success');
            }
        } else {
            // Add new product
            const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
            this.products.push({
                id: newId,
                name,
                description,
                price,
                stock,
                category,
                icon
            });
            this.showToast('เพิ่มสินค้าใหม่สำเร็จ', 'success');
        }

        this.saveProducts();
        this.renderProducts();
        this.closeProductModal();
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (confirm(`คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderProducts();
            this.showToast('ลบสินค้าสำเร็จ', 'success');
        }
    }

    updateStats() {
        // Calculate statistics
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
        const completedOrders = this.orders.filter(o => o.status === 'completed').length;

        // Update UI
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const pendingOrdersEl = document.getElementById('pendingOrders');
        const completedOrdersEl = document.getElementById('completedOrders');

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (totalRevenueEl) totalRevenueEl.textContent = `฿${totalRevenue.toLocaleString()}`;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
    }
}

// Initialize Admin Panel
const adminPanel = new AdminPanel();
