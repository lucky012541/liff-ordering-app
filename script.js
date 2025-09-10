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
        this.editingProduct = null;
        this.checkoutStep = 1;
        this.deliveryInfo = {};
        this.paymentMethod = 'cash';
        
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
            this.renderAdminProducts();
            
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
            this.openCheckoutModal();
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

        // Checkout modal controls
        document.getElementById('closeCheckoutModal').addEventListener('click', () => {
            this.closeCheckoutModal();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextCheckoutStep();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevCheckoutStep();
        });

        document.getElementById('confirmOrderBtn').addEventListener('click', () => {
            this.confirmOrder();
        });

        // Close checkout modal when clicking outside
        document.getElementById('checkoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'checkoutModal') {
                this.closeCheckoutModal();
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
        } else if (tabName === 'admin') {
            this.renderAdminProducts();
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
                <div class="product-icon">
                    <i class="${product.icon}"></i>
                </div>
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

        document.getElementById('modalProductImage').innerHTML = `<i class="${product.icon}"></i>`;
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
                    <div class="cart-item-icon">
                        <i class="${item.icon}"></i>
                    </div>
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

    // Checkout Modal Functions
    openCheckoutModal() {
        if (this.cart.length === 0) return;
        
        this.checkoutStep = 1;
        this.resetCheckoutSteps();
        document.getElementById('checkoutModal').style.display = 'block';
    }

    closeCheckoutModal() {
        document.getElementById('checkoutModal').style.display = 'none';
        this.checkoutStep = 1;
        this.resetCheckoutSteps();
    }

    resetCheckoutSteps() {
        // Hide all steps
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show first step
        document.getElementById('deliveryStep').classList.add('active');
        
        // Reset buttons
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('confirmOrderBtn').style.display = 'none';
    }

    nextCheckoutStep() {
        if (this.checkoutStep === 1) {
            // Validate delivery form
            if (!this.validateDeliveryForm()) {
                return;
            }
            this.saveDeliveryInfo();
            this.showPaymentStep();
        } else if (this.checkoutStep === 2) {
            this.savePaymentMethod();
            this.showSummaryStep();
        }
    }

    prevCheckoutStep() {
        if (this.checkoutStep === 2) {
            this.showDeliveryStep();
        } else if (this.checkoutStep === 3) {
            this.showPaymentStep();
        }
    }

    validateDeliveryForm() {
        const form = document.getElementById('deliveryForm');
        const requiredFields = ['customerName', 'customerPhone', 'deliveryAddress'];
        
        for (let field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                this.showToast(`กรุณากรอก${input.previousElementSibling.textContent}`, 'error');
                input.focus();
                return false;
            }
        }
        
        // Validate phone number
        const phone = document.getElementById('customerPhone').value;
        if (!/^[0-9]{10}$/.test(phone.replace(/-/g, ''))) {
            this.showToast('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)', 'error');
            document.getElementById('customerPhone').focus();
            return false;
        }
        
        return true;
    }

    saveDeliveryInfo() {
        const form = document.getElementById('deliveryForm');
        const formData = new FormData(form);
        
        this.deliveryInfo = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            deliveryAddress: formData.get('deliveryAddress'),
            deliveryNote: formData.get('deliveryNote') || ''
        };
    }

    savePaymentMethod() {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        this.paymentMethod = selectedPayment ? selectedPayment.value : 'cash';
    }

    showDeliveryStep() {
        this.checkoutStep = 1;
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('deliveryStep').classList.add('active');
        
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('confirmOrderBtn').style.display = 'none';
    }

    showPaymentStep() {
        this.checkoutStep = 2;
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('paymentStep').classList.add('active');
        
        document.getElementById('prevBtn').style.display = 'inline-flex';
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('confirmOrderBtn').style.display = 'none';
    }

    showSummaryStep() {
        this.checkoutStep = 3;
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('summaryStep').classList.add('active');
        
        this.renderOrderSummary();
        
        document.getElementById('prevBtn').style.display = 'inline-flex';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('confirmOrderBtn').style.display = 'inline-flex';
    }

    renderOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const paymentMethodText = {
            'cash': 'เงินสด',
            'transfer': 'โอนเงิน',
            'promptpay': 'PromptPay'
        };

        orderSummary.innerHTML = `
            <div class="summary-section">
                <h5><i class="fas fa-user"></i> ข้อมูลลูกค้า</h5>
                <p><strong>ชื่อ:</strong> ${this.deliveryInfo.customerName}</p>
                <p><strong>เบอร์โทร:</strong> ${this.deliveryInfo.customerPhone}</p>
                <p><strong>ที่อยู่:</strong> ${this.deliveryInfo.deliveryAddress}</p>
                ${this.deliveryInfo.deliveryNote ? `<p><strong>หมายเหตุ:</strong> ${this.deliveryInfo.deliveryNote}</p>` : ''}
            </div>
            
            <div class="summary-section">
                <h5><i class="fas fa-credit-card"></i> วิธีการชำระเงิน</h5>
                <p>${paymentMethodText[this.paymentMethod]}</p>
            </div>
            
            <div class="summary-section">
                <h5><i class="fas fa-shopping-cart"></i> รายการสินค้า</h5>
                ${this.cart.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>฿${item.price * item.quantity}</span>
                    </div>
                `).join('')}
                <div class="summary-total">
                    <span><strong>ยอดรวม</strong></span>
                    <span><strong>฿${total}</strong></span>
                </div>
            </div>
        `;
    }

    async confirmOrder() {
        if (this.cart.length === 0) return;

        const order = {
            id: Date.now(),
            date: new Date().toLocaleString('th-TH'),
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            deliveryInfo: this.deliveryInfo,
            paymentMethod: this.paymentMethod
        };

        // ส่ง Flex Message ก่อนยืนยันคำสั่งซื้อ
        await this.sendOrderFlexMessage(order);
        
        this.orders.unshift(order);
        this.cart = [];
        this.saveCart();
        this.saveOrders();
        this.updateCartUI();
        this.renderOrders();
        this.closeCheckoutModal();
        this.switchTab('orders');
        
        this.showToast('ส่งรายการสั่งซื้อไปในแชทแล้ว! หมายเลขคำสั่งซื้อ: ' + order.id);
    }

    async sendOrderFlexMessage(order) {
        try {
            // สร้าง Flex Message
            const flexMessage = this.createOrderFlexMessage(order);
            
            // ส่ง Flex Message กลับไปในแชท
            if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
                await liff.sendMessages([flexMessage]);
                
                // ส่งข้อความเพิ่มเติมสำหรับเจ้าของร้าน
                const ownerMessage = {
                    type: 'text',
                    text: `📋 คำสั่งซื้อใหม่ #${order.id}\n\n💡 เจ้าของร้าน: ตอบกลับ "ยืนยัน" หรือ "ยกเลิก" เพื่อยืนยันคำสั่งซื้อ\n\n📱 หรือเปิดแอปเพื่อดูรายละเอียดเพิ่มเติม`
                };
                
                await liff.sendMessages([ownerMessage]);
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

        const paymentMethodText = {
            'cash': 'เงินสด',
            'transfer': 'โอนเงิน',
            'promptpay': 'PromptPay'
        };

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
                            text: '👤 ข้อมูลลูกค้า',
                            weight: 'bold',
                            size: 'md',
                            margin: 'md',
                            color: '#FF8C00'
                        },
                        {
                            type: 'text',
                            text: `ชื่อ: ${order.deliveryInfo.customerName}`,
                            size: 'sm',
                            color: '#333333',
                            margin: 'sm'
                        },
                        {
                            type: 'text',
                            text: `เบอร์โทร: ${order.deliveryInfo.customerPhone}`,
                            size: 'sm',
                            color: '#333333',
                            margin: 'xs'
                        },
                        {
                            type: 'text',
                            text: `ที่อยู่: ${order.deliveryInfo.deliveryAddress}`,
                            size: 'sm',
                            color: '#333333',
                            margin: 'xs',
                            wrap: true
                        },
                        ...(order.deliveryInfo.deliveryNote ? [{
                            type: 'text',
                            text: `หมายเหตุ: ${order.deliveryInfo.deliveryNote}`,
                            size: 'sm',
                            color: '#666666',
                            margin: 'xs',
                            wrap: true
                        }] : []),
                        {
                            type: 'separator',
                            margin: 'md'
                        },
                        {
                            type: 'text',
                            text: '💳 วิธีการชำระเงิน',
                            weight: 'bold',
                            size: 'md',
                            margin: 'md',
                            color: '#FF8C00'
                        },
                        {
                            type: 'text',
                            text: paymentMethodText[order.paymentMethod] || 'เงินสด',
                            size: 'sm',
                            color: '#333333',
                            margin: 'sm'
                        },
                        {
                            type: 'separator',
                            margin: 'md'
                        },
                        {
                            type: 'text',
                            text: '🛒 รายการสินค้า',
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
                        },
                        {
                            type: 'separator',
                            margin: 'md'
                        },
                        {
                            type: 'text',
                            text: '💡 เจ้าของร้าน: ตอบกลับ "ยืนยัน" หรือ "ยกเลิก" เพื่อยืนยันคำสั่งซื้อ',
                            size: 'xs',
                            color: '#FFFFFF',
                            align: 'center',
                            margin: 'md',
                            wrap: true
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

    // Admin Product Management Functions
    renderAdminProducts() {
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
            <div class="admin-product-card">
                <img src="${product.image}" alt="${product.name}" class="admin-product-image" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image'">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="admin-product-price">฿${product.price}</div>
                    <div class="admin-product-stock">สต็อก: ${product.stock} ชิ้น</div>
                    <div class="admin-product-category">หมวดหมู่: ${this.getCategoryText(product.category)}</div>
                </div>
                <div class="admin-product-actions">
                    <button class="edit-btn" onclick="app.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> แก้ไข
                    </button>
                    <button class="delete-btn" onclick="app.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCategoryText(category) {
        const categoryMap = {
            'ice': 'น้ำแข็ง',
            'water': 'น้ำดื่ม',
            'gas': 'แก๊สหุงต้ม'
        };
        return categoryMap[category] || category;
    }

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
            // แก้ไขสินค้า
            const productIndex = this.products.findIndex(p => p.id === this.editingProduct);
            if (productIndex !== -1) {
                this.products[productIndex] = {
                    ...this.products[productIndex],
                    ...productData
                };
                this.showToast('แก้ไขสินค้าสำเร็จ!');
            }
        } else {
            // เพิ่มสินค้าใหม่
            const newProduct = {
                id: Date.now(),
                ...productData
            };
            this.products.push(newProduct);
            this.showToast('เพิ่มสินค้าสำเร็จ!');
        }

        this.saveProducts();
        this.renderProducts();
        this.renderAdminProducts();
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
            this.renderAdminProducts();
            this.showToast('ลบสินค้าสำเร็จ!');
        }
    }

    saveProducts() {
        localStorage.setItem('liff_products', JSON.stringify(this.products));
    }

    loadProducts() {
        const savedProducts = localStorage.getItem('liff_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        }
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
                    <div class="order-actions">
                        ${order.status === 'pending' ? `
                            <button class="confirm-btn" onclick="app.confirmOrder(${order.id})">
                                <i class="fas fa-check"></i> ยืนยัน
                            </button>
                            <button class="cancel-btn" onclick="app.updateOrderStatus(${order.id}, 'cancelled')">
                                <i class="fas fa-times"></i> ยกเลิก
                            </button>
                        ` : ''}
                        ${order.status === 'confirmed' ? `
                            <button class="preparing-btn" onclick="app.updateOrderStatus(${order.id}, 'preparing')">
                                <i class="fas fa-clock"></i> กำลังเตรียม
                            </button>
                        ` : ''}
                        ${order.status === 'preparing' ? `
                            <button class="ready-btn" onclick="app.updateOrderStatus(${order.id}, 'ready')">
                                <i class="fas fa-check-circle"></i> พร้อมรับ
                            </button>
                        ` : ''}
                        ${order.status === 'ready' ? `
                            <button class="complete-btn" onclick="app.updateOrderStatus(${order.id}, 'completed')">
                                <i class="fas fa-check-double"></i> เสร็จสิ้น
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
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

    // ฟังก์ชันสำหรับเจ้าของร้านยืนยันคำสั่งซื้อ
    confirmOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'confirmed';
            this.saveOrders();
            this.renderOrders();
            this.showToast(`ยืนยันคำสั่งซื้อ #${orderId} แล้ว`);
        }
    }

    // ฟังก์ชันสำหรับเจ้าของร้านอัปเดตสถานะ
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders();
            this.renderOrders();
            this.showToast(`อัปเดตสถานะคำสั่งซื้อ #${orderId} เป็น ${this.getStatusText(newStatus)}`);
        }
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
