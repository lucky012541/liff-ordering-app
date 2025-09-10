// Admin Dashboard - Main JavaScript
class AdminDashboard {
    constructor() {
        this.products = [];
        this.orders = [];
        this.currentUser = null;
        this.currentTab = 'orders';
        this.editingProduct = null;
        this.salesChart = null;
        
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
                // LIFF not available, use mock data
                this.currentUser = {
                    displayName: 'Admin User',
                    userId: 'admin_user_123',
                    pictureUrl: 'https://via.placeholder.com/50'
                };
                this.updateUserInfo();
                resolve();
                return;
            }

            liff.init({ liffId: '2006986568-yjrOkKqm' }, () => {
                if (liff.isLoggedIn()) {
                    liff.getProfile().then(profile => {
                        this.currentUser = profile;
                        this.updateUserInfo();
                        resolve();
                    }).catch(reject);
                } else {
                    liff.login();
                }
            }, reject);
        });
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
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                category: 'ice',
                stock: 100
            },
            {
                id: 2,
                name: 'น้ำแข็งใหญ่',
                description: 'น้ำแข็งก้อนใหญ่ เหมาะสำหรับเก็บอาหารและเครื่องดื่ม',
                price: 40,
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                category: 'ice',
                stock: 80
            },
            {
                id: 3,
                name: 'น้ำแข็งบด',
                description: 'น้ำแข็งบดละเอียด เหมาะสำหรับเครื่องดื่มเย็น',
                price: 40,
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                category: 'ice',
                stock: 120
            },
            {
                id: 4,
                name: 'น้ำดื่ม 1 ลิตร',
                description: 'น้ำดื่มสะอาด บรรจุขวด 1 ลิตร',
                price: 15,
                image: 'https://images.unsplash.com/photo-1548839140-29a749e1daf5?w=400&h=300&fit=crop',
                category: 'water',
                stock: 200
            },
            {
                id: 5,
                name: 'น้ำดื่ม 500 มล.',
                description: 'น้ำดื่มสะอาด บรรจุขวด 500 มิลลิลิตร',
                price: 10,
                image: 'https://images.unsplash.com/photo-1548839140-29a749e1daf5?w=400&h=300&fit=crop',
                category: 'water',
                stock: 300
            },
            {
                id: 6,
                name: 'แก๊สหุงต้ม 15 กก.',
                description: 'แก๊สหุงต้มถัง 15 กิโลกรัม สำหรับครัวเรือน',
                price: 350,
                image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
                category: 'gas',
                stock: 50
            },
            {
                id: 7,
                name: 'แก๊สหุงต้ม 12 กก.',
                description: 'แก๊สหุงต้มถัง 12 กิโลกรัม ขนาดเล็ก',
                price: 280,
                image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
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

        document.getElementById('productImage').addEventListener('change', (e) => {
            this.previewImage(e);
        });

        // Close admin modal when clicking outside
        document.getElementById('adminProductModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminProductModal') {
                this.closeAdminModal();
            }
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
        }
    }

    renderOrders() {
        const ordersManagement = document.getElementById('ordersManagement');
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        let filteredOrders = this.orders;

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

        if (filteredOrders.length === 0) {
            ordersManagement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>ไม่มีคำสั่งซื้อ</h3>
                    <p>ยังไม่มีคำสั่งซื้อในระบบ</p>
                </div>
            `;
            return;
        }

        ordersManagement.innerHTML = filteredOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-date">${order.date}</span>
                    </div>
                    <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                
                ${order.deliveryInfo ? `
                    <div class="delivery-info">
                        <h5><i class="fas fa-user"></i> ข้อมูลลูกค้า</h5>
                        <p><strong>ชื่อ:</strong> ${order.deliveryInfo.customerName}</p>
                        <p><strong>เบอร์โทร:</strong> ${order.deliveryInfo.customerPhone}</p>
                        <p><strong>ที่อยู่:</strong> ${order.deliveryInfo.deliveryAddress}</p>
                        ${order.deliveryInfo.deliveryNote ? `<p><strong>หมายเหตุ:</strong> ${order.deliveryInfo.deliveryNote}</p>` : ''}
                        <p><strong>ชำระเงิน:</strong> ${this.getPaymentMethodText(order.paymentMethod || 'cash')}</p>
                    </div>
                ` : ''}
                
                <div class="order-items">
                    <h5><i class="fas fa-shopping-cart"></i> รายการสินค้า</h5>
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <span>${item.name} x${item.quantity}</span>
                            <span>฿${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                    <div class="order-item-detail order-total">
                        <span>รวมทั้งสิ้น</span>
                        <span>฿${order.total}</span>
                    </div>
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="confirm-btn" onclick="admin.confirmOrder(${order.id})">
                            <i class="fas fa-check"></i> ยืนยัน
                        </button>
                        <button class="cancel-btn" onclick="admin.updateOrderStatus(${order.id}, 'cancelled')">
                            <i class="fas fa-times"></i> ยกเลิก
                        </button>
                    ` : ''}
                    ${order.status === 'confirmed' ? `
                        <button class="preparing-btn" onclick="admin.updateOrderStatus(${order.id}, 'preparing')">
                            <i class="fas fa-clock"></i> กำลังเตรียม
                        </button>
                    ` : ''}
                    ${order.status === 'preparing' ? `
                        <button class="ready-btn" onclick="admin.updateOrderStatus(${order.id}, 'ready')">
                            <i class="fas fa-check-circle"></i> พร้อมรับ
                        </button>
                    ` : ''}
                    ${order.status === 'ready' ? `
                        <button class="complete-btn" onclick="admin.updateOrderStatus(${order.id}, 'completed')">
                            <i class="fas fa-check-double"></i> เสร็จสิ้น
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderProducts() {
        const productsManagement = document.getElementById('productsManagement');
        
        if (this.products.length === 0) {
            productsManagement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>ยังไม่มีสินค้า</h3>
                    <p>เพิ่มสินค้าใหม่เพื่อเริ่มขาย</p>
                </div>
            `;
            return;
        }

        productsManagement.innerHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image'">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="product-price">฿${product.price}</div>
                    <div class="product-stock">สต็อก: ${product.stock} ชิ้น</div>
                    <div class="product-category">หมวดหมู่: ${this.getCategoryText(product.category)}</div>
                </div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> แก้ไข
                    </button>
                    <button class="delete-btn" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = `฿${totalRevenue.toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
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
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
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
        
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                title.textContent = 'แก้ไขสินค้า';
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('previewImg').src = product.image;
                document.getElementById('previewImg').style.display = 'block';
            }
        } else {
            title.textContent = 'เพิ่มสินค้าใหม่';
            form.reset();
            document.getElementById('previewImg').style.display = 'none';
        }
        
        modal.style.display = 'block';
    }

    closeAdminModal() {
        document.getElementById('adminProductModal').style.display = 'none';
        this.editingProduct = null;
        document.getElementById('adminProductForm').reset();
        document.getElementById('previewImg').style.display = 'none';
    }

    previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImg = document.getElementById('previewImg');
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    saveProduct() {
        const form = document.getElementById('adminProductForm');
        const formData = new FormData(form);
        
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseInt(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: formData.get('category'),
            image: document.getElementById('previewImg').src || 'https://via.placeholder.com/400x300?text=No+Image'
        };

        if (this.editingProduct) {
            // Edit product
            const productIndex = this.products.findIndex(p => p.id === this.editingProduct);
            if (productIndex !== -1) {
                this.products[productIndex] = {
                    ...this.products[productIndex],
                    ...productData
                };
                this.showToast('แก้ไขสินค้าสำเร็จ!');
            }
        } else {
            // Add new product
            const newProduct = {
                id: Date.now(),
                ...productData
            };
            this.products.push(newProduct);
            this.showToast('เพิ่มสินค้าสำเร็จ!');
        }

        this.saveProducts();
        this.renderProducts();
        this.closeAdminModal();
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
