// LIFF Ordering App - Main JavaScript
class OrderingApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.orders = [];
        this.currentUser = null;
        this.currentTab = 'products';
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Initialize LIFF
            await this.initializeLIFF();
            
            // Load sample data
            this.loadSampleData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial content
            this.renderProducts();
            this.updateCartUI();
            this.renderOrders();
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showToast('เกิดข้อผิดพลาดในการโหลดแอป', 'error');
            this.showLoading(false);
        }
    }

    async initializeLIFF() {
        return new Promise((resolve, reject) => {
            if (typeof liff === 'undefined') {
                // LIFF not available, use mock data
                this.currentUser = {
                    displayName: 'ผู้ใช้ทดสอบ',
                    userId: 'test_user_123',
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

    loadSampleData() {
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
            }
        ];

        // Load cart from localStorage
        const savedCart = localStorage.getItem('liff_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }

        // Load orders from localStorage
        const savedOrders = localStorage.getItem('liff_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderProducts();
        });

        // Category filter
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentCategory = e.currentTarget.dataset.category;
                this.renderProducts();
            });
        });

        // Cart icon click
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.switchTab('cart');
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('decreaseQty').addEventListener('click', () => {
            this.decreaseQuantity();
        });

        document.getElementById('increaseQty').addEventListener('click', () => {
            this.increaseQuantity();
        });

        document.getElementById('addToCartBtn').addEventListener('click', () => {
            this.addToCartFromModal();
        });

        // Close modal when clicking outside
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target.id === 'productModal') {
                this.closeModal();
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
        if (tabName === 'cart') {
            this.updateCartUI();
        } else if (tabName === 'orders') {
            this.renderOrders();
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const filteredProducts = this.getFilteredProducts();

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>ไม่พบสินค้า</h3>
                    <p>ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ที่แตกต่าง</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" onclick="app.openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">฿${product.price}</div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); app.addToCart(${product.id})">
                        <i class="fas fa-plus"></i> เพิ่มในตะกร้า
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFilteredProducts() {
        return this.products.filter(product => {
            const matchesCategory = this.currentCategory === 'all' || product.category === this.currentCategory;
            const matchesSearch = product.name.toLowerCase().includes(this.searchQuery) ||
                                product.description.toLowerCase().includes(this.searchQuery);
            return matchesCategory && matchesSearch;
        });
    }

    openProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modalProductImage').src = product.image;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductDescription').textContent = product.description;
        document.getElementById('modalProductPrice').textContent = `฿${product.price}`;
        document.getElementById('modalQuantity').textContent = '1';

        this.currentModalProduct = product;
        this.currentModalQuantity = 1;

        document.getElementById('productModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentModalProduct = null;
        this.currentModalQuantity = 1;
    }

    decreaseQuantity() {
        if (this.currentModalQuantity > 1) {
            this.currentModalQuantity--;
            document.getElementById('modalQuantity').textContent = this.currentModalQuantity;
        }
    }

    increaseQuantity() {
        if (this.currentModalQuantity < this.currentModalProduct.stock) {
            this.currentModalQuantity++;
            document.getElementById('modalQuantity').textContent = this.currentModalQuantity;
        }
    }

    addToCartFromModal() {
        if (this.currentModalProduct) {
            this.addToCart(this.currentModalProduct.id, this.currentModalQuantity);
            this.closeModal();
        }
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showToast('ลบสินค้าออกจากตะกร้าแล้ว');
    }

    updateCartQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `฿${total}`;

        // Enable/disable checkout button
        checkoutBtn.disabled = this.cart.length === 0;

        // Render cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>ตะกร้าว่าง</h3>
                    <p>เพิ่มสินค้าลงตะกร้าเพื่อเริ่มสั่งซื้อ</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">฿${item.price}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="app.removeFromCart(${item.id})" title="ลบสินค้า">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    async checkout() {
        if (this.cart.length === 0) return;

        const order = {
            id: Date.now(),
            date: new Date().toLocaleString('th-TH'),
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending'
        };

        this.orders.unshift(order);
        this.cart = [];
        this.saveCart();
        this.saveOrders();
        this.updateCartUI();
        this.renderOrders();
        this.switchTab('orders');
        
        // ส่ง Flex Message กลับไปในแชท
        await this.sendOrderFlexMessage(order);
        
        this.showToast('สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: ' + order.id);
    }

    async sendOrderFlexMessage(order) {
        try {
            // สร้าง Flex Message
            const flexMessage = this.createOrderFlexMessage(order);
            
            // ส่ง Flex Message กลับไปในแชท
            if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
                await liff.sendMessages([flexMessage]);
                this.showToast('ส่งรายการสั่งซื้อไปในแชทแล้ว!');
            } else {
                // ถ้าไม่ใช่ LIFF ให้แสดงข้อมูลคำสั่งซื้อ
                this.showOrderDetails(order);
            }
        } catch (error) {
            console.error('Error sending flex message:', error);
            this.showToast('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่');
        }
    }

    createOrderFlexMessage(order) {
        const itemsText = order.items.map(item => 
            `${item.name} x${item.quantity} = ฿${item.price * item.quantity}`
        ).join('\n');

        return {
            type: 'flex',
            altText: `คำสั่งซื้อ #${order.id} - ฿${order.total}`,
            contents: {
                type: 'bubble',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '🧊 ร้านขายน้ำแข็ง',
                            weight: 'bold',
                            size: 'xl',
                            color: '#FFFFFF'
                        },
                        {
                            type: 'text',
                            text: `คำสั่งซื้อ #${order.id}`,
                            size: 'sm',
                            color: '#FFFFFF',
                            margin: 'md'
                        }
                    ]
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'รายการสินค้า',
                            weight: 'bold',
                            size: 'md',
                            margin: 'md',
                            color: '#FF8C00'
                        },
                        {
                            type: 'text',
                            text: itemsText,
                            size: 'sm',
                            color: '#333333',
                            margin: 'sm',
                            wrap: true
                        },
                        {
                            type: 'separator',
                            margin: 'md'
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                        {
                            type: 'text',
                            text: 'ยอดรวม',
                            size: 'md',
                            weight: 'bold',
                            color: '#FF8C00'
                        },
                        {
                            type: 'text',
                            text: `฿${order.total}`,
                            size: 'md',
                            weight: 'bold',
                            color: '#FF8C00',
                            align: 'end'
                        }
                            ],
                            margin: 'md'
                        }
                    ]
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `วันที่: ${order.date}`,
                            size: 'xs',
                            color: '#FFFFFF',
                            align: 'center'
                        },
                        {
                            type: 'text',
                            text: 'ขอบคุณสำหรับการสั่งซื้อ! 🎉',
                            size: 'sm',
                            color: '#FFFFFF',
                            align: 'center',
                            margin: 'md'
                        }
                    ]
                },
                styles: {
                    header: {
                        backgroundColor: '#FF8C00'
                    },
                    footer: {
                        backgroundColor: '#FF8C00'
                    }
                }
            }
        };
    }

    showOrderDetails(order) {
        const itemsText = order.items.map(item => 
            `${item.name} x${item.quantity} = ฿${item.price * item.quantity}`
        ).join('\n');

        const orderText = `🧊 ร้านขายน้ำแข็ง
คำสั่งซื้อ #${order.id}

รายการสินค้า:
${itemsText}

ยอดรวม: ฿${order.total}
วันที่: ${order.date}

ขอบคุณสำหรับการสั่งซื้อ! 🎉`;

        // แสดงข้อมูลคำสั่งซื้อในหน้าจอ
        alert(orderText);
    }

    renderOrders() {
        const ordersList = document.getElementById('ordersList');

        if (this.orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list-alt"></i>
                    <h3>ยังไม่มีคำสั่งซื้อ</h3>
                    <p>เริ่มสั่งซื้อสินค้าเพื่อดูประวัติการสั่งซื้อ</p>
                </div>
            `;
        } else {
            ordersList.innerHTML = this.orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-date">${order.date}</span>
                        <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                    </div>
                    <div class="order-items">
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
                </div>
            `).join('');
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'รอดำเนินการ',
            'completed': 'เสร็จสิ้น',
            'cancelled': 'ยกเลิก'
        };
        return statusMap[status] || status;
    }

    saveCart() {
        localStorage.setItem('liff_cart', JSON.stringify(this.cart));
    }

    saveOrders() {
        localStorage.setItem('liff_orders', JSON.stringify(this.orders));
    }

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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OrderingApp();
});

// Handle LIFF errors
if (typeof liff !== 'undefined') {
    liff.init({ liffId: '2006986568-yjrOkKqm' }, () => {
        // LIFF initialized successfully
    }, (err) => {
        console.error('LIFF initialization failed', err);
    });
}
