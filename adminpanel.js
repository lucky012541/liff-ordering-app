class AdminPanel {
    constructor() {
        this.orders = [];
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.loadOrders();
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
        this.renderAdminOrders();
    }

    loadOrders() {
        const savedOrders = localStorage.getItem('liff_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            this.orders = [];
        }
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
}

// Initialize Admin Panel
const adminPanel = new AdminPanel();
