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
        this.paymentSlipDataUrl = null;
        this.transferRef = '';
        this.paymentVerified = false;
        this.orderConfirmed = false;
        
        // Enable login for production use
        this.loginRequired = false; // 🔧 DEVELOPMENT MODE: ปิดล็อกอิน LINE
        
        console.log('🔧 DEVELOPMENT MODE: LINE Login DISABLED');
        
        // Allow overriding via query string (?dev=false for production)
        this.applyLoginToggleFromQuery();
        
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
        if (document.getElementById('productsManagement')) { 
            this.renderAdminProducts();
        }
        
        this.showLoading(false);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showToast('เกิดข้อผิดพลาดในการโหลดแอป', 'error');
            this.showLoading(false);
        }
    }

    async initializeLIFF() {
        return new Promise((resolve, reject) => {
            // 🔧 DEVELOPMENT MODE: Skip LIFF entirely
            if (!this.loginRequired) {
                console.log('🔧 DEVELOPMENT MODE: Skipping LIFF initialization completely');
                this.currentUser = {
                    displayName: 'โหมดพัฒนา',
                    userId: 'dev_fallback_' + Date.now(),
                    pictureUrl: 'https://via.placeholder.com/50'
                };
                this.updateUserInfo();
                this.showToast('🔧 โหมดพัฒนา: ไม่ต้องล็อกอิน LINE', 'info');
                resolve();
                return;
            }

            // Check if running in LINE app
            const isInLineApp = navigator.userAgent.includes('Line') || window.location.search.includes('liff');

            if (typeof liff === 'undefined') {
                console.warn('LIFF SDK not loaded');
                if (isInLineApp) {
                    this.showToast('ไม่สามารถโหลด LINE LIFF ได้ กรุณาลองใหม่', 'error');
                    reject(new Error('LIFF SDK not available'));
                    return;
                } else {
                    // Not in LINE app, use mock data for development
                    this.currentUser = {
                        displayName: 'โหมดพัฒนา (No LIFF)',
                        userId: 'dev_no_liff_' + Date.now(),
                        pictureUrl: 'https://via.placeholder.com/50'
                    };
                    this.updateUserInfo();
                    this.showToast('โหมดพัฒนา: ไม่มี LIFF SDK', 'info');
                    resolve();
                    return;
                }
            }

            // Initialize LIFF with proper error handling
            liff.init({
                liffId: '2006986568-yjrOkKqm',
                withLoginOnExternalBrowser: true
            }).then(() => {
                if (liff.isLoggedIn()) {
                    return liff.getProfile();
                } else {
                    if (this.loginRequired) {
                        console.log('User not logged in, redirecting to login');
                        liff.login({
                            redirectUri: window.location.href
                        });
                        return; // Will not resolve here
                    } else {
                        console.log('Login not required, using fallback');
                        return null;
                    }
                }
            }).then(profile => {
                if (profile) {
                    this.currentUser = profile;
                    this.updateUserInfo();
                    console.log('User profile loaded:', profile);
                    this.showToast(`สวัสดี ${profile.displayName}!`, 'success');
                    resolve();
                }
            }).catch(err => {
                console.error('LIFF initialization error:', err);

                if (isInLineApp) {
                    this.showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ LINE กรุณาลองใหม่', 'error');
                    reject(err);
                } else {
                    // Fallback for development
                    console.warn('Falling back to mock user for development');
                    this.currentUser = {
                        displayName: 'โหมดพัฒนา',
                        userId: 'dev_fallback_' + Date.now(),
                        pictureUrl: 'https://via.placeholder.com/50'
                    };
                    this.updateUserInfo();
                    this.showToast('โหมดพัฒนา: ใช้งานแบบจำลอง', 'info');
                    resolve();
                }
            });
        });
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.displayName;
        }
    }

    applyLoginToggleFromQuery() {
        try {
            if (typeof window === 'undefined' || !window.location) return;
            const params = new URLSearchParams(window.location.search || '');
            if (!params.has('forceLogin')) return;
            const raw = params.get('forceLogin');
            if (raw === null || raw === '') {
                // presence without value -> true
                this.loginRequired = true;
                return;
            }
            const truthy = /^(1|true|yes|on)$/i.test(raw);
            const falsy = /^(0|false|no|off)$/i.test(raw);
            if (truthy) this.loginRequired = true;
            if (falsy) this.loginRequired = false;
        } catch (e) {
            console.warn('Could not parse forceLogin from query:', e);
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
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });


        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderProducts();
            });
        }

        // Category filter
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentCategory = e.currentTarget.dataset.category;
                this.renderProducts();
            });
        });

        // Bottom checkout button click
        const checkoutBtnMini = document.getElementById('checkoutBtnMini');
        if (checkoutBtnMini) {
            checkoutBtnMini.addEventListener('click', (e) => {
                e.preventDefault();
                // Always open checkout modal (don't interfere with modal navigation)
                this.openCheckoutModal();
            });
        }


        // Checkout button
        const checkoutBtnEl = document.getElementById('checkoutBtn');
        if (checkoutBtnEl) {
            checkoutBtnEl.addEventListener('click', () => {
                this.openCheckoutModal();
            });
        }

        // Modal controls
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        const decreaseQtyBtn = document.getElementById('decreaseQty');
        if (decreaseQtyBtn) {
            decreaseQtyBtn.addEventListener('click', () => this.decreaseQuantity());
        }

        const increaseQtyBtn = document.getElementById('increaseQty');
        if (increaseQtyBtn) {
            increaseQtyBtn.addEventListener('click', () => this.increaseQuantity());
        }

        const addToCartBtnEl = document.getElementById('addToCartBtn');
        if (addToCartBtnEl) {
            addToCartBtnEl.addEventListener('click', () => this.addToCartFromModal());
        }

        // Close modal when clicking outside
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target.id === 'productModal') {
                    this.closeModal();
                }
            });
        }

        // Admin modal controls (guard for customer page where admin UI is not present)
        const closeAdminModalBtn = document.getElementById('closeAdminModal');
        if (closeAdminModalBtn) {
            closeAdminModalBtn.addEventListener('click', () => this.closeAdminModal());
        }

        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => this.closeAdminModal());
        }

        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openAdminModal());
        }

        const adminProductForm = document.getElementById('adminProductForm');
        if (adminProductForm) {
            adminProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        const productImageInput = document.getElementById('productImage');
        if (productImageInput) {
            productImageInput.addEventListener('change', (e) => this.previewImage(e));
        }

        // Close admin modal when clicking outside
        const adminProductModal = document.getElementById('adminProductModal');
        if (adminProductModal) {
            adminProductModal.addEventListener('click', (e) => {
                if (e.target.id === 'adminProductModal') {
                    this.closeAdminModal();
                }
            });
        }

        // Checkout modal controls
        const closeCheckoutModalBtn = document.getElementById('closeCheckoutModal');
        if (closeCheckoutModalBtn) {
            closeCheckoutModalBtn.addEventListener('click', () => this.closeCheckoutModal());
        }

        // Use event delegation for next button to handle dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.id === 'nextBtn' || e.target.closest('#nextBtn')) {
                e.preventDefault();
                console.log('Next button clicked via delegation');
                this.nextCheckoutStep();
            }
        });

        // Use event delegation for prev and confirm buttons too
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prevBtn' || e.target.closest('#prevBtn')) {
                e.preventDefault();
                console.log('Previous button clicked via delegation');
                this.prevCheckoutStep();
            }
            if (e.target.id === 'confirmOrderBtn' || e.target.closest('#confirmOrderBtn')) {
                e.preventDefault();
                console.log('Confirm order button clicked via delegation');
                this.confirmOrder();
            }
        });

        // Payment method change -> update details panel
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        if (paymentRadios && paymentRadios.length) {
            paymentRadios.forEach(r => r.addEventListener('change', () => this.updatePaymentDetailsPanel()));
            // Initialize panel on load
            this.updatePaymentDetailsPanel();
        }

        // Receipt actions
        const shareReceiptBtn = document.getElementById('shareReceiptBtn');
        if (shareReceiptBtn) {
            shareReceiptBtn.addEventListener('click', () => this.shareReceipt());
        }
        const printReceiptBtn = document.getElementById('printReceiptBtn');
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => window.print());
        }
        const closeReceiptBtn = document.getElementById('closeReceiptBtn');
        if (closeReceiptBtn) {
            closeReceiptBtn.addEventListener('click', () => {
                this.closeCheckoutModal();
                this.switchTab('orders');
            });
        }

        // Close checkout modal when clicking outside
        document.getElementById('checkoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'checkoutModal') {
                this.closeCheckoutModal();
            }
        });

        // Real-time form validation
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');
        const deliveryAddress = document.getElementById('deliveryAddress');

        if (customerName) {
            customerName.addEventListener('input', () => {
                this.validateField(customerName, 'กรุณากรอกชื่อ-นามสกุล');
            });
        }

        if (customerPhone) {
            customerPhone.addEventListener('input', () => {
                this.validatePhoneField(customerPhone);
            });
        }

        if (deliveryAddress) {
            deliveryAddress.addEventListener('input', () => {
                this.validateField(deliveryAddress, 'กรุณากรอกที่อยู่จัดส่ง');
            });
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        let contentId;
        switch(tabName) {
            case 'menu': contentId = 'products'; break;
            case 'orders': contentId = 'orders'; break;
            default: contentId = 'products';
        }

        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Load content based on tab
        if (tabName === 'orders') {
            this.renderUserOrders();
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.warn('Products grid not found, skipping render');
            return;
        }

        // Make sure products are loaded
        if (!this.products || this.products.length === 0) {
            console.warn('No products loaded yet');
            productsGrid.innerHTML = '<div class="loading">กำลังโหลดสินค้า...</div>';
            return;
        }

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

        console.log(`Rendered ${filteredProducts.length} products`);
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

        const modalImage = document.getElementById('modalProductImage');
        const modalName = document.getElementById('modalProductName');
        const modalDesc = document.getElementById('modalProductDescription');
        const modalPrice = document.getElementById('modalProductPrice');
        const modalQty = document.getElementById('modalQuantity');
        const modalEl = document.getElementById('productModal');
        if (!modalImage || !modalName || !modalDesc || !modalPrice || !modalQty || !modalEl) {
            return;
        }

        modalImage.innerHTML = `<i class="${product.icon}"></i>`;
        modalName.textContent = product.name;
        modalDesc.textContent = product.description;
        modalPrice.textContent = `฿${product.price}`;
        modalQty.textContent = '1';

        this.currentModalProduct = product;
        this.currentModalQuantity = 1;

        modalEl.style.display = 'block';
    }

    closeModal() {
        const modalEl = document.getElementById('productModal');
        if (modalEl) {
            modalEl.style.display = 'none';
        }
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
        
        // Update cart review if modal is open and on step 1
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal && checkoutModal.style.display === 'block' && this.checkoutStep === 1) {
            this.renderCartReview();
            
            // Close modal if cart is empty
            if (this.cart.length === 0) {
                this.closeCheckoutModal();
            }
        }
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartUI();
            
            // Update cart review if modal is open and on step 1
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal && checkoutModal.style.display === 'block' && this.checkoutStep === 1) {
                this.renderCartReview();
            }
        }
    }

    updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        // Bottom app bar elements
        const bottomAppBar = document.getElementById('bottomAppBar');
        const cartCountMini = document.getElementById('cartCountMini');
        const cartItemsText = document.getElementById('cartItemsText');
        const cartTotalText = document.getElementById('cartTotalText');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) cartCount.textContent = totalItems;
        if (cartCountMini) cartCountMini.textContent = totalItems;

        // Update cart total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = `฿${total}`;
        if (cartTotalText) cartTotalText.textContent = `฿${total}`;

        // Update bottom app bar
        if (cartItemsText) {
            cartItemsText.textContent = totalItems === 0 ? '0 รายการ' : 
                totalItems === 1 ? '1 รายการ' : `${totalItems} รายการ`;
        }

        // Show/hide bottom app bar
        if (bottomAppBar) {
            if (totalItems > 0) {
                bottomAppBar.classList.add('show');
                document.body.classList.add('has-cart-bar');
                
                // Always show "สั่งซื้อ" text when cart has items
                const checkoutBtnMini = document.getElementById('checkoutBtnMini');
                if (checkoutBtnMini) {
                    checkoutBtnMini.innerHTML = '<span>สั่งซื้อ</span><i class="fas fa-arrow-right"></i>';
                }
            } else {
                bottomAppBar.classList.remove('show');
                document.body.classList.remove('has-cart-bar');
            }
        }

        // Enable/disable checkout button
        if (checkoutBtn) checkoutBtn.disabled = this.cart.length === 0;

        // Render cart items - only if cartItems element exists
        if (cartItems) {
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
                        <div class="item-icon">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">฿${item.price} ต่อชิ้น</div>
                        </div>
                        <div class="item-controls">
                            <div class="cart-quantity-controls">
                                <button class="quantity-btn minus" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="item-quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="item-total">฿${item.price * item.quantity}</div>
                            <button class="quantity-btn remove" onclick="app.removeFromCart(${item.id})" title="ลบสินค้า">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // Checkout Modal Functions
    openCheckoutModal() {
        if (this.cart.length === 0) {
            this.showToast('ตะกร้าว่าง กรุณาเพิ่มสินค้าก่อน', 'error');
            return;
        }
        
        this.checkoutStep = 1;
        this.resetCheckoutSteps();
        this.showCartReviewStep();
        
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.style.display = 'block';
        }
        this.renderStepper();
    }

    closeCheckoutModal() {
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        this.checkoutStep = 1;
        this.resetCheckoutSteps();
    }

    resetCheckoutSteps() {
        // Hide all steps
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach(step => step.classList.remove('active'));
        
        // Reset buttons
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (prevBtn) prevBtn.style.display = 'none';
        if (confirmOrderBtn) confirmOrderBtn.style.display = 'none';
        
        // Reset checkout step
        this.checkoutStep = 1;
    }

    nextCheckoutStep() {
        console.log('🔄 nextCheckoutStep called, current step:', this.checkoutStep);
        
        if (this.checkoutStep === 1) {
            // Step 1: Cart Review -> Customer Info
            console.log('🛒 Moving from cart review to customer info');
            this.showCustomerInfoStep();
        } else if (this.checkoutStep === 2) {
            // Step 2: Customer Info -> Payment Method
            console.log('👤 Validating customer info...');
            if (!this.validateCustomerForm()) {
                console.log('❌ Customer form validation failed');
                return;
            }
            console.log('✅ Customer form validated, moving to payment');
            this.saveCustomerInfo();
            this.showPaymentStep();
        } else if (this.checkoutStep === 3) {
            // Step 3: Payment Method -> Order Summary
            console.log('💳 Validating payment method...');
            if (!this.validatePaymentMethod()) {
                console.log('❌ Payment method validation failed');
                return;
            }
            console.log('✅ Payment validated, moving to summary');
            this.savePaymentMethod();
            this.showSummaryStep();
        } else if (this.checkoutStep === 4) {
            // Step 4: Order Summary -> Complete Order
            console.log('📋 Confirming order...');
            this.confirmOrder();
        } else {
            console.log('⚠️ Unknown step:', this.checkoutStep);
        }
    }

    prevCheckoutStep() {
        if (this.checkoutStep === 2) {
            this.showCartReviewStep();
        } else if (this.checkoutStep === 3) {
            this.showCustomerInfoStep();
        } else if (this.checkoutStep === 4) {
            this.showPaymentStep();
        } else if (this.checkoutStep === 5) {
            this.showSummaryStep();
        }
    }

    // Step Functions
    showCartReviewStep() {
        console.log('📋 Showing cart review step');
        this.checkoutStep = 1;
        this.hideAllSteps();
        
        const cartReviewStep = document.getElementById('cartReviewStep');
        if (cartReviewStep) cartReviewStep.classList.add('active');
        
        this.renderCartReview();
        this.updateCheckoutButtons();
        this.renderStepper();
    }

    showCustomerInfoStep() {
        console.log('👤 Showing customer info step');
        this.checkoutStep = 2;
        this.hideAllSteps();
        
        const customerInfoStep = document.getElementById('customerInfoStep');
        if (customerInfoStep) customerInfoStep.classList.add('active');
        
        this.updateCheckoutButtons();
        this.renderStepper();
    }

    hideAllSteps() {
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach(step => step.classList.remove('active'));
    }



    showSummaryStep() {
        console.log('📋 Showing summary step');
        this.checkoutStep = 4;
        this.hideAllSteps();
        
        const summaryStep = document.getElementById('summaryStep');
        if (!summaryStep) {
            console.log('❌ Summary step element not found');
            return;
        }
        
        console.log('✅ Summary step element found, activating...');
        summaryStep.classList.add('active');
        
        this.renderOrderSummary();
        this.updateCheckoutButtons();
        this.renderStepper();
        console.log('📋 Summary step activated successfully');
    }

    async showReceiptStep() {
        this.checkoutStep = 5;
        this.hideAllSteps();
        
        const receiptStep = document.getElementById('receiptStep');
        if (receiptStep) receiptStep.classList.add('active');
        
        // Create order from current state and save it
        const order = {
            id: Date.now(),
            items: [...this.cart],
            customer: {
                customerName: document.getElementById('customerName')?.value || 'ทดสอบ บอท',
                customerPhone: document.getElementById('customerPhone')?.value || '0812345678',
                deliveryAddress: document.getElementById('deliveryAddress')?.value || '123 ถนนทดสอบ',
                deliveryNote: document.getElementById('deliveryNote')?.value || ''
            },
            paymentMethod: this.paymentMethod || 'cash',
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toLocaleString('th-TH'),
            status: 'confirmed'
        };
        
        // Save order to localStorage (fallback)
        const orders = JSON.parse(localStorage.getItem('liff_orders') || '[]');
        orders.push(order);
        localStorage.setItem('liff_orders', JSON.stringify(orders));

        // Save to GitHub if configured
        if (window.githubStorage && window.githubStorage.isConfigured()) {
            try {
                const result = await window.githubStorage.saveOrder(order);
                if (result.success) {
                    console.log('✅ บันทึกคำสั่งซื้อลง GitHub สำเร็จ');
                    this.showToast('บันทึกคำสั่งซื้อลง GitHub สำเร็จ!');
                } else {
                    console.error('❌ ไม่สามารถบันทึกลง GitHub ได้:', result.error);
                    this.showToast('เกิดข้อผิดพลาดในการบันทึกลง GitHub', 'error');
                }
            } catch (error) {
                console.error('❌ GitHub Storage Error:', error);
                this.showToast('เกิดข้อผิดพลาดในการบันทึกลง GitHub', 'error');
            }
        }
        
        this.renderReceipt();
        this.updateCheckoutButtons();
        this.renderStepper();
    }

    hideAllSteps() {
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach(step => step.classList.remove('active'));
    }

    updateCheckoutButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        
        if (!nextBtn || !prevBtn || !confirmOrderBtn) return;
        
        console.log('Updating buttons for step:', this.checkoutStep);
        
        // Show/hide previous button
        prevBtn.style.display = this.checkoutStep > 1 ? 'inline-flex' : 'none';
        
        // Show/hide next/confirm buttons
        if (this.checkoutStep < 4) {
            nextBtn.style.display = 'inline-flex';
            confirmOrderBtn.style.display = 'none';
            console.log('Showing next button for step', this.checkoutStep);
        } else if (this.checkoutStep === 4) {
            nextBtn.style.display = 'none';
            confirmOrderBtn.style.display = 'inline-flex';
            console.log('Showing confirm button for step 4');
        } else {
            nextBtn.style.display = 'none';
            confirmOrderBtn.style.display = 'none';
            console.log('Hiding all buttons for step', this.checkoutStep);
        }
    }

    validateCustomerForm() {
        console.log('📋 Validating customer form...');
        
        // 🔧 DEVELOPMENT MODE: Auto-fill and skip validation
        if (!this.loginRequired) {
            console.log('🔧 DEVELOPMENT MODE: Auto-filling customer form');
            this.autoFillCustomerForm();
            return true;
        }

        const form = document.getElementById('customerForm');
        if (!form) {
            console.log('❌ Customer form not found');
            this.showToast('ไม่พบฟอร์มข้อมูล', 'error');
            return false;
        }
        
        const requiredFields = ['customerName', 'customerPhone', 'deliveryAddress'];
        
        for (let fieldId of requiredFields) {
            const input = document.getElementById(fieldId);
            if (!input || !input.value.trim()) {
                let fieldName = '';
                switch(fieldId) {
                    case 'customerName': fieldName = 'ชื่อ-นามสกุล'; break;
                    case 'customerPhone': fieldName = 'เบอร์โทรศัพท์'; break;
                    case 'deliveryAddress': fieldName = 'ที่อยู่จัดส่ง'; break;
                }
                console.log(`❌ Missing field: ${fieldName}`);
                this.showToast(`กรุณากรอก${fieldName}`, 'error');
                if (input) input.focus();
                return false;
            }
        }
        
        // Validate phone number
        const phoneInput = document.getElementById('customerPhone');
        if (phoneInput) {
            const phone = phoneInput.value;
            const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
            if (cleanPhone.length < 9 || cleanPhone.length > 11) {
                console.log('❌ Invalid phone number');
                this.showToast('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-11 หลัก)', 'error');
                phoneInput.focus();
                return false;
            }
        }
        
        console.log('✅ Customer form validated successfully');
        return true;
    }

    autoFillCustomerForm() {
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');
        const deliveryAddress = document.getElementById('deliveryAddress');
        
        if (customerName && !customerName.value) {
            customerName.value = 'ทดสอบ ลูกค้า';
        }
        if (customerPhone && !customerPhone.value) {
            customerPhone.value = '0812345678';
        }
        if (deliveryAddress && !deliveryAddress.value) {
            deliveryAddress.value = '123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10110';
        }
        
        console.log('🔧 Auto-filled customer form for development');
    }

    validatePaymentMethod() {
        console.log('🔍 Validating payment method...');
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = selectedPayment ? selectedPayment.value : 'cash';
        console.log('💳 Selected payment method:', paymentMethod);

        // Cash payment doesn't need validation
        if (paymentMethod === 'cash') {
            console.log('💵 Cash payment - no validation needed');
            this.paymentVerified = true;
            return true;
        }

        // 🔧 DEVELOPMENT MODE: Skip slip validation
        if (!this.loginRequired) {
            console.log('🔧 DEVELOPMENT MODE: Skipping slip validation for', paymentMethod);
            this.paymentVerified = true;
            this.showToast(`🔧 โหมดพัฒนา: ข้าม${paymentMethod === 'transfer' ? 'สลิปโอนเงิน' : 'สลิป PromptPay'}`, 'info');
            return true;
        }

        // For transfer and promptpay, check if slip is uploaded (production only)
        if (paymentMethod === 'transfer') {
            const transferSlip = document.getElementById('transferSlip');
            if (!transferSlip || !transferSlip.files || transferSlip.files.length === 0) {
                this.showToast('กรุณาอัปโหลดสลิปการโอนเงิน', 'error');
                if (transferSlip) transferSlip.focus();
                return false;
            }
            // Basic slip verification
            this.paymentVerified = this.verifyPaymentSlip(transferSlip.files[0]);
        } else if (paymentMethod === 'promptpay') {
            const paymentSlip = document.getElementById('paymentSlip');
            if (!paymentSlip || !paymentSlip.files || paymentSlip.files.length === 0) {
                this.showToast('กรุณาอัปโหลดสลิป PromptPay', 'error');
                if (paymentSlip) paymentSlip.focus();
                return false;
            }
            // Basic slip verification
            this.paymentVerified = this.verifyPaymentSlip(paymentSlip.files[0]);
        }

        if (!this.paymentVerified) {
            this.showToast('กรุณาอัปโหลดสลิปการชำระเงินที่ถูกต้อง', 'error');
            return false;
        }

        console.log('✅ Payment method validated successfully');
        return true;
    }

    verifyPaymentSlip(file) {
        // Basic file validation
        if (!file) return false;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น', 'error');
            return false;
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showToast('ไฟล์รูปภาพต้องไม่เกิน 5MB', 'error');
            return false;
        }

        return true;
    }

    renderCartReview() {
        const cartItemsReview = document.getElementById('cartItemsReview');
        const cartTotalReview = document.getElementById('cartTotalReview');
        
        if (!cartItemsReview || !cartTotalReview) return;
        
        // Render cart items with quantity controls
        cartItemsReview.innerHTML = this.cart.map(item => `
            <div class="cart-review-item">
                <div class="item-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">฿${item.price} ต่อชิ้น</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-total">฿${item.price * item.quantity}</div>
                    <button class="remove-item-btn" onclick="app.removeFromCart(${item.id})" title="ลบสินค้า">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalReview.textContent = `฿${total}`;
    }

    renderOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        orderSummary.innerHTML = `
            <div class="summary-section">
                <h5><i class="fas fa-shopping-cart"></i> รายการสินค้า</h5>
                ${this.cart.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>฿${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="summary-section">
                <h5><i class="fas fa-user"></i> ข้อมูลลูกค้า</h5>
                <div class="summary-item">
                    <span>ชื่อ:</span>
                    <span>${this.customerInfo?.customerName || '-'}</span>
                </div>
                <div class="summary-item">
                    <span>เบอร์โทร:</span>
                    <span>${this.customerInfo?.customerPhone || '-'}</span>
                </div>
                <div class="summary-item">
                    <span>ที่อยู่:</span>
                    <span>${this.customerInfo?.deliveryAddress || '-'}</span>
                </div>
            </div>
            
            <div class="summary-section">
                <h5><i class="fas fa-credit-card"></i> การชำระเงิน</h5>
                <div class="summary-item">
                    <span>วิธีชำระ:</span>
                    <span>${this.getPaymentMethodName()}</span>
                </div>
            </div>
            
            <div class="summary-total">
                <div class="total-row">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span class="total-amount">฿${total}</span>
                </div>
            </div>
        `;
    }

    getPaymentMethodName() {
        switch(this.paymentMethod) {
            case 'cash': return 'เงินสด';
            case 'transfer': return 'โอนเงิน';
            case 'promptpay': return 'PromptPay';
            default: return 'ไม่ระบุ';
        }
    }

    copyAccountNumber(accountNumber) {
        navigator.clipboard.writeText(accountNumber).then(() => {
            this.showToast('คัดลอกเลขบัญชีแล้ว', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = accountNumber;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('คัดลอกเลขบัญชีแล้ว', 'success');
        });
    }

    previewTransferSlip(input) {
        const preview = document.getElementById('transferSlipPreview');
        if (input.files && input.files[0] && preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
            this.showToast('อัปโหลดสลิปการโอนเงินแล้ว', 'success');
        }
    }

    previewPaymentSlip(input) {
        const preview = document.getElementById('paymentSlipPreview');
        if (input.files && input.files[0] && preview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
            this.showToast('อัปโหลดสลิป PromptPay แล้ว', 'success');
        }
    }

    saveCustomerInfo() {
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        const formData = new FormData(form);
        this.customerInfo = {
            customerName: formData.get('customerName') || '',
            customerPhone: formData.get('customerPhone') || '',
            deliveryAddress: formData.get('deliveryAddress') || '',
            deliveryNote: formData.get('deliveryNote') || ''
        };
    }

    savePaymentMethod() {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        this.paymentMethod = selectedPayment ? selectedPayment.value : 'cash';
    }

    updatePaymentDetailsPanel() {
        const panel = document.getElementById('paymentDetailsPanel');
        if (!panel) return;
        const method = (document.querySelector('input[name="paymentMethod"]:checked') || {}).value || 'cash';
        let html = '';
        if (method === 'cash') {
            html = `
                <div class="payment-info">
                    <p><i class="fas fa-money-bill"></i> ชำระเป็นเงินสดกับผู้ส่งสินค้า</p>
                </div>
            `;
        } else if (method === 'transfer') {
            html = `
                <div class="payment-info">
                    <div class="bank-transfer-info">
                        <h5><i class="fas fa-university"></i> โอนเข้าบัญชีธนาคารของร้าน</h5>
                        <div class="bank-account-card">
                            <div class="bank-header">
                                <i class="fas fa-university bank-icon"></i>
                                <div class="bank-details">
                                    <h6>ธนาคารกรุงศรีอยุธยา</h6>
                                    <p>สาขาหลัก</p>
                                </div>
                            </div>
                            <div class="account-info">
                                <div class="info-row">
                                    <span class="label">ชื่อบัญชี:</span>
                                    <span class="value">มีนรญาณ์ พรหมเพชร</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">เลขที่บัญชี:</span>
                                    <span class="value account-number">720-1-11288-5</span>
                                    <button class="copy-btn" onclick="app.copyAccountNumber('720-1-11288-5')">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="info-row">
                                    <span class="label">ประเภทบัญชี:</span>
                                    <span class="value">ออมทรัพย์</span>
                                </div>
                            </div>
                        </div>
                        <div class="transfer-note">
                            <p><i class="fas fa-info-circle"></i> หมายเลขอ้างอิง (ถ้ามี)</p>
                            <input type="text" id="transferReference" placeholder="เช่น 123ABC" class="reference-input">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-receipt"></i> อัปโหลดสลิปการโอนเงิน *</label>
                            <input type="file" id="transferSlip" accept="image/*" onchange="app.previewTransferSlip(this)">
                            <div class="upload-note">
                                <small><i class="fas fa-camera"></i> เลือกไฟล์ หรือ ไม่ได้เลือกไฟล์จัด</small>
                            </div>
                            <div class="image-preview" style="margin-top:10px;">
                                <img id="transferSlipPreview" style="max-width:200px; display:none; border-radius:8px; border:1px solid #eee;"/>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (method === 'promptpay') {
            html = `
                <div class="payment-info">
                    <p><i class="fas fa-qrcode"></i> สแกน QR PromptPay ของร้าน และอัปโหลดสลิป</p>
                    <div class="promptpay-qr">
                        <div class="qr-container">
                            <div class="qr-code-image">
                                <img src="promptpay-qr.png" alt="QR Code PromptPay" class="promptpay-qr-img">
                                <p style="margin-top: 10px; font-weight: 600; text-align: center;">QR Code PromptPay</p>
                            </div>
                        </div>
                        <div class="bank-info">
                            <h5><i class="fas fa-university"></i> ข้อมูลบัญชี</h5>
                            <p><strong>ชื่อ:</strong> มีนรญาณ์ พรหมเพชร</p>
                            <p><strong>เลขบัญชี:</strong> 720-1-11288-5</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>อัปโหลดสลิป PromptPay *</label>
                        <input type="file" id="paymentSlip" accept="image/*" onchange="app.previewPaymentSlip(this)">
                        <div class="image-preview" style="margin-top:10px;">
                            <img id="paymentSlipPreview" style="max-width:200px; display:none; border-radius:8px; border:1px solid #eee;"/>
                        </div>
                    </div>
                </div>
            `;
        }
        panel.innerHTML = html;

        // Bind slip & ref handlers
        const refInput = document.getElementById('transferRefInput');
        if (refInput) {
            refInput.addEventListener('input', () => this.transferRef = refInput.value.trim());
        }
        const slipInput = document.getElementById('paymentSlip');
        if (slipInput) {
            slipInput.addEventListener('change', (e) => this.handleSlipUpload(e));
        }
    }

    handleSlipUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.paymentSlipDataUrl = e.target.result;
            const preview = document.getElementById('paymentSlipPreview');
            if (preview) {
                preview.src = this.paymentSlipDataUrl;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    validateField(field, errorMessage) {
        if (field.value.trim()) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
        }
    }

    validatePhoneField(field) {
        const cleanPhone = field.value.replace(/\D/g, '');
        if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
        }
    }

    showDeliveryStep() {
        this.checkoutStep = 1;
        document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
        const deliveryStep = document.getElementById('deliveryStep');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (!deliveryStep || !prevBtn || !nextBtn || !confirmOrderBtn) return;
        deliveryStep.classList.add('active');
        
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        confirmOrderBtn.style.display = 'none';
        this.renderStepper();
    }

    showPaymentStep() {
        console.log('💳 Showing payment step');
        this.checkoutStep = 3;
        this.hideAllSteps();
        
        const paymentStep = document.getElementById('paymentStep');
        if (!paymentStep) {
            console.log('❌ Payment step element not found');
            return;
        }
        
        console.log('✅ Payment step element found, activating...');
        paymentStep.classList.add('active');
        
        this.updatePaymentDetailsPanel();
        this.updateCheckoutButtons();
        this.renderStepper();
        console.log('💳 Payment step activated successfully');
    }

    showSummaryStep() {
        this.checkoutStep = 3;
        document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
        const summaryStep = document.getElementById('summaryStep');
        if (!summaryStep) return;
        summaryStep.classList.add('active');
        
        this.renderOrderSummary();
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (!prevBtn || !nextBtn || !confirmOrderBtn) return;
        prevBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'none';
        confirmOrderBtn.style.display = 'inline-flex';
        this.renderStepper();
    }

    showReceiptStep(order) {
        this.checkoutStep = 4;
        document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
        const receiptStep = document.getElementById('receiptStep');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (!receiptStep || !prevBtn || !nextBtn || !confirmOrderBtn) return;
        receiptStep.classList.add('active');

        // Hide main action buttons (use receipt actions)
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        confirmOrderBtn.style.display = 'none';

        // Render receipt content in both receiptContent and receipt elements
        const receiptHTML = this.generateReceiptHTML(order);
        
        const receiptContent = document.getElementById('receiptContent');
        if (receiptContent) {
            receiptContent.innerHTML = receiptHTML;
        }
        
        const receipt = document.getElementById('receipt');
        if (receipt) {
            receipt.innerHTML = receiptHTML;
        }

        this.renderStepper();
    }

    renderOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const paymentMethodText = {
            'cash': 'เงินสด',
            'transfer': 'โอนเงิน',
            'promptpay': 'PromptPay'
        };

        orderSummary.innerHTML = `
            <div class="summary-section">
                <h5><i class="fas fa-user"></i> ข้อมูลลูกค้า</h5>
                <p><strong>ชื่อ:</strong> ${this.customerInfo.customerName || 'ไม่ระบุ'}</p>
                <p><strong>เบอร์โทร:</strong> ${this.customerInfo.customerPhone || 'ไม่ระบุ'}</p>
                <p><strong>ที่อยู่:</strong> ${this.customerInfo.deliveryAddress || 'ไม่ระบุ'}</p>
                ${this.customerInfo.deliveryNote ? `<p><strong>หมายเหตุ:</strong> ${this.customerInfo.deliveryNote}</p>` : ''}
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
        console.log('🎯 confirmOrder() called!');
        try {
            // Validate payment before proceeding
            console.log('🔍 Validating payment before order confirmation...');
            if (!this.validatePaymentMethod()) {
                console.log('❌ Payment validation failed in confirmOrder');
                return;
            }

            console.log('✅ Payment validated, proceeding with order...');
            this.showToast('กำลังดำเนินการสั่งซื้อ...', 'info');

            // Get payment slip if uploaded
            let paymentSlip = null;
            let paymentSlipFile = null;

            if (this.paymentMethod === 'transfer') {
                const transferSlipInput = document.getElementById('transferSlip');
                if (transferSlipInput && transferSlipInput.files && transferSlipInput.files[0]) {
                    paymentSlipFile = transferSlipInput.files[0];
                    paymentSlip = URL.createObjectURL(paymentSlipFile);
                }
            } else if (this.paymentMethod === 'promptpay') {
                const paymentSlipInput = document.getElementById('paymentSlip');
                if (paymentSlipInput && paymentSlipInput.files && paymentSlipInput.files[0]) {
                    paymentSlipFile = paymentSlipInput.files[0];
                    paymentSlip = URL.createObjectURL(paymentSlipFile);
                }
            }

            // Create order object with enhanced data
            const order = {
                id: Date.now(),
                items: [...this.cart],
                customer: this.customerInfo,
                paymentMethod: this.paymentMethod,
                paymentSlip: paymentSlip,
                paymentSlipFile: paymentSlipFile,
                total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                date: new Date().toLocaleString('th-TH'),
                status: this.paymentVerified ? 'confirmed' : 'pending_payment',
                paymentMeta: {
                    transferRef: this.transferRef || '',
                    slipDataUrl: this.paymentSlipDataUrl || null,
                    verified: this.paymentVerified
                },
                userId: this.currentUser ? this.currentUser.userId : 'guest',
                orderNumber: this.generateOrderNumber()
            };

            console.log('💾 Saving order...', order);
            
            // Save order locally first
            this.orders.unshift(order);
            this.saveOrders();

            // 🔧 DEVELOPMENT MODE: Skip LINE message sending
            if (!this.loginRequired) {
                console.log('🔧 DEVELOPMENT MODE: Skipping LINE message');
                
                // Clear cart and update UI
                this.cart = [];
                this.saveCart();
                this.updateCartUI();

                // Show success message
                this.showToast('✅ สั่งซื้อสำเร็จ! (โหมดพัฒนา) หมายเลข: ' + order.orderNumber, 'success');

                // Show receipt
                this.showReceiptStep(order);

                // Reset checkout state
                this.resetCheckoutState();

                // Track order for status updates
                this.trackOrderStatus(order.id);
                
                console.log('🎉 Order completed successfully in development mode');
                return;
            }

            // Send order notification to LINE (production only)
            console.log('📱 Sending LINE message...');
            let messageSent = false;
            
            try {
                messageSent = await this.sendOrderFlexMessage(order);
            } catch (error) {
                console.error('❌ Failed to send LINE message:', error);
                messageSent = false;
            }

            // Clear cart and update UI (regardless of message status)
            this.cart = [];
            this.saveCart();
            this.updateCartUI();

            if (messageSent) {
                // Show success message
                this.showToast('✅ สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: ' + order.orderNumber, 'success');
            } else {
                // If LINE message failed, still show receipt but warn user
                this.showToast('✅ สั่งซื้อสำเร็จ! (ไม่ส่งแจ้งเตือน LINE) หมายเลข: ' + order.orderNumber, 'success');
            }

            // Show receipt
            this.showReceiptStep(order);

            // Reset checkout state
            this.resetCheckoutState();

            // Track order for status updates
            this.trackOrderStatus(order.id);
            
            console.log('🎉 Order process completed');

        } catch (error) {
            console.error('Order confirmation error:', error);
            this.showToast('❌ เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่', 'error');
        }
    }

    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
    }

    resetCheckoutState() {
        this.checkoutStep = 1;
        this.deliveryInfo = {};
        this.paymentMethod = 'cash';
        this.paymentSlipDataUrl = null;
        this.transferRef = '';
        this.paymentVerified = false;
        this.orderConfirmed = false;
    }

    trackOrderStatus(orderId) {
        // Store order ID for status tracking
        const trackedOrders = JSON.parse(localStorage.getItem('tracked_orders') || '[]');
        if (!trackedOrders.includes(orderId)) {
            trackedOrders.push(orderId);
            localStorage.setItem('tracked_orders', JSON.stringify(trackedOrders));
        }
    }

    async sendOrderFlexMessage(order) {
        try {
            this.showToast('กำลังส่งคำสั่งซื้อ...', 'info');

            // Check if we can send messages
            if (typeof liff === 'undefined' || !liff.isLoggedIn()) {
                console.warn('LIFF not available or user not logged in');
                this.showOrderDetails(order);
                return false;
            }

            // สร้าง Flex Message
            const flexMessage = this.createOrderFlexMessage(order);

            // ส่ง Flex Message กลับไปในแชท
            await liff.sendMessages([flexMessage]);

            // ส่งข้อความเพิ่มเติมสำหรับเจ้าของร้าน
            const ownerMessage = {
                type: 'text',
                text: `📋 คำสั่งซื้อใหม่ ${order.orderNumber}\n\n💡 เจ้าของร้าน: ตอบกลับ "ยืนยัน" หรือ "ยกเลิก" เพื่อจัดการคำสั่งซื้อ\n\n📱 เปิด Admin Panel เพื่อดูรายละเอียดเพิ่มเติม`
            };

            await liff.sendMessages([ownerMessage]);

            console.log('Order notification sent successfully');
            return true;

        } catch (error) {
            console.error('Error sending flex message:', error);

            // Enhanced error handling
            let errorMessage = 'ไม่สามารถส่งการแจ้งเตือนได้';
            let shouldRetry = false;

            if (error.message?.includes('permission') || error.code === 403) {
                errorMessage = 'ไม่มีสิทธิ์ส่งข้อความ กรุณาอนุญาตสิทธิ์ใน LINE';
            } else if (error.message?.includes('network') || error.code >= 500) {
                errorMessage = 'ปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต';
                shouldRetry = true;
            } else if (error.message?.includes('quota') || error.code === 429) {
                errorMessage = 'ส่งข้อความได้ไม่เกินจำนวนที่กำหนด กรุณารอสักครู่';
                shouldRetry = true;
            } else if (error.code === 400) {
                errorMessage = 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง';
            }

            this.showToast(`${errorMessage}`, 'warning');

            // Show order details as fallback
            setTimeout(() => {
                this.showOrderDetails(order);
            }, 1500);

            return false;
        }
    }

    showOrderDetails(order) {
        const itemsText = order.items.map(item =>
            `${item.name} x${item.quantity} = ฿${item.price * item.quantity}`
        ).join('\n');

        const paymentText = {
            cash: 'เงินสดปลายทาง',
            transfer: 'โอนเงิน',
            promptpay: 'PromptPay'
        }[order.paymentMethod] || order.paymentMethod;

        const orderText = `🧊 ร้านขายน้ำแข็ง - คำสั่งซื้อ ${order.orderNumber}

📋 รายการสินค้า:
${itemsText}

💰 ยอดรวม: ฿${order.total}
💳 ชำระโดย: ${paymentText}
📅 วันที่: ${order.date}

👤 ข้อมูลลูกค้า:
${order.customer.customerName}
📞 ${order.customer.customerPhone}
🏠 ${order.customer.deliveryAddress}

${order.customer.deliveryNote ? `📝 หมายเหตุ: ${order.customer.deliveryNote}` : ''}

ขอบคุณสำหรับการสั่งซื้อ! 🎉

*คำสั่งซื้อนี้ได้รับการบันทึกแล้ว ร้านจะติดต่อกลับในเร็วๆ นี้*`;

        // Show in modal or alert
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'รายละเอียดคำสั่งซื้อ',
                text: orderText,
                icon: 'info',
                confirmButtonText: 'ตกลง'
            });
        } else {
            alert(orderText);
        }
    }

    createOrderFlexMessage(order) {
        const paymentMethodText = {
            'cash': '💵 เงินสด',
            'transfer': '🏦 โอนเงิน',
            'promptpay': '📱 PromptPay'
        };

        const paymentIcons = {
            'cash': '💵',
            'transfer': '🏦',
            'promptpay': '📱'
        };

        return {
            type: 'flex',
            altText: `🧊 คำสั่งซื้อ #${order.id} - ฿${order.total}`,
            contents: {
                type: 'bubble',
                size: 'giga',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '🧊',
                                    size: 'xl',
                                    align: 'center',
                                    flex: 1
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'ร้านขายน้ำแข็ง',
                                            weight: 'bold',
                                            size: 'lg',
                                            color: '#FFFFFF',
                                            align: 'center'
                                        },
                                        {
                                            type: 'text',
                                            text: '❄️ บริการจัดส่งน้ำแข็ง ❄️',
                                            size: 'xs',
                                            color: '#FFFFFF',
                                            align: 'center',
                                            margin: 'sm'
                                        }
                                    ],
                                    flex: 4
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: `📋 คำสั่งซื้อ #${order.id}`,
                                    size: 'sm',
                                    color: '#FFFFFF',
                                    weight: 'bold'
                                },
                                {
                                    type: 'text',
                                    text: `⏰ ${order.date}`,
                                    size: 'xs',
                                    color: '#FFFFFF',
                                    align: 'end'
                                }
                            ],
                            margin: 'md'
                        }
                    ],
                    backgroundColor: '#FF8C00',
                    paddingAll: 'lg'
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        // Customer Info Section
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: '👤',
                                            size: 'sm',
                                            flex: 1
                                        },
                                        {
                                            type: 'text',
                                            text: 'ข้อมูลลูกค้า',
                                            weight: 'bold',
                                            size: 'md',
                                            color: '#FF8C00',
                                            flex: 5
                                        }
                                    ]
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: `📛 ${order.deliveryInfo.customerName}`,
                                            size: 'sm',
                                            color: '#333333',
                                            margin: 'sm'
                                        },
                                        {
                                            type: 'text',
                                            text: `📞 ${order.deliveryInfo.customerPhone}`,
                                            size: 'sm',
                                            color: '#333333',
                                            margin: 'xs'
                                        },
                                        {
                                            type: 'text',
                                            text: `🏠 ${order.deliveryInfo.deliveryAddress}`,
                                            size: 'sm',
                                            color: '#333333',
                                            margin: 'xs',
                                            wrap: true
                                        },
                                        ...(order.deliveryInfo.deliveryNote ? [{
                                            type: 'text',
                                            text: `📝 หมายเหตุ: ${order.deliveryInfo.deliveryNote}`,
                                            size: 'sm',
                                            color: '#666666',
                                            margin: 'xs',
                                            wrap: true
                                        }] : [])
                                    ],
                                    margin: 'md',
                                    backgroundColor: '#F8F9FA',
                                    cornerRadius: 'md',
                                    paddingAll: 'md'
                                }
                            ],
                            margin: 'md'
                        },

                        // Payment Method Section
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: '💳',
                                            size: 'sm',
                                            flex: 1
                                        },
                                        {
                                            type: 'text',
                                            text: 'วิธีการชำระเงิน',
                                            weight: 'bold',
                                            size: 'md',
                                            color: '#FF8C00',
                                            flex: 5
                                        }
                                    ]
                                },
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: paymentIcons[order.paymentMethod] || '💵',
                                            size: 'md',
                                            flex: 1
                                        },
                                        {
                                            type: 'text',
                                            text: paymentMethodText[order.paymentMethod] || '💵 เงินสด',
                                            size: 'sm',
                                            color: '#333333',
                                            weight: 'bold',
                                            flex: 5
                                        }
                                    ],
                                    margin: 'md',
                                    backgroundColor: '#FFF3CD',
                                    cornerRadius: 'md',
                                    paddingAll: 'md'
                                }
                            ],
                            margin: 'md'
                        },

                        // Order Items Section
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: '🛒',
                                            size: 'sm',
                                            flex: 1
                                        },
                                        {
                                            type: 'text',
                                            text: 'รายการสินค้า',
                                            weight: 'bold',
                                            size: 'md',
                                            color: '#FF8C00',
                                            flex: 5
                                        }
                                    ]
                                },
                                ...order.items.map(item => ({
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: `• ${item.name}`,
                                            size: 'sm',
                                            color: '#333333',
                                            flex: 4,
                                            wrap: true
                                        },
                                        {
                                            type: 'text',
                                            text: `x${item.quantity}`,
                                            backgroundColor: '#F8F9FA',
                                            cornerRadius: 'sm',
                                            paddingAll: 'sm'
                                        },
                                    ],
                                    margin: 'xs',
                                    backgroundColor: '#FFF3CD',
                                    cornerRadius: 'md',
                                    paddingAll: 'md'
                                })),
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
                                            text: '💰 ยอดรวมทั้งสิ้น',
                                            size: 'md',
                                            weight: 'bold',
                                            color: '#FF8C00',
                                            flex: 3
                                        },
                                        {
                                            type: 'text',
                                            text: `฿${order.total}`,
                                            size: 'lg',
                                            weight: 'bold',
                                            color: '#FF8C00',
                                            flex: 2,
                                            align: 'end'
                                        }
                                    ],
                                    margin: 'md',
                                    backgroundColor: '#FFF3CD',
                                    cornerRadius: 'md',
                                    paddingAll: 'md'
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
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '🎉 ขอบคุณสำหรับการสั่งซื้อ!',
                                    size: 'sm',
                                    color: '#FFFFFF',
                                    weight: 'bold',
                                    align: 'center',
                                    wrap: true
                                }
                            ],
                            backgroundColor: '#28A745',
                            cornerRadius: 'lg',
                            paddingAll: 'md',
                            margin: 'md'
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: '📢 สำหรับเจ้าของร้าน:',
                                    size: 'xs',
                                    color: '#FFFFFF',
                                    weight: 'bold',
                                    align: 'center'
                                },
                                {
                                    type: 'text',
                                    text: 'ตอบกลับ "ยืนยัน" หรือ "ยกเลิก" เพื่อจัดการคำสั่งซื้อ',
                                    size: 'xs',
                                    color: '#FFFFFF',
                                    align: 'center',
                                    margin: 'xs',
                                    wrap: true
                                }
                            ],
                            backgroundColor: '#FF8C00',
                            cornerRadius: 'md',
                            paddingAll: 'sm'
                        }
                    ],
                    backgroundColor: '#FF8C00',
                    paddingAll: 'lg'
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

    renderReceipt() {
        const receipt = document.getElementById('receipt');
        if (!receipt) {
            console.log('Receipt element not found');
            return;
        }

        // Get the last order or create a sample order for display
        const orders = JSON.parse(localStorage.getItem('liff_orders') || '[]');
        let order;
        
        if (orders.length > 0) {
            order = orders[orders.length - 1];
            console.log('Using existing order:', order);
        } else {
            // Create a sample order from current cart and customer info
            const customerInfo = {
                customerName: document.getElementById('customerName')?.value || 'ทดสอบ บอท',
                customerPhone: document.getElementById('customerPhone')?.value || '0812345678',
                deliveryAddress: document.getElementById('deliveryAddress')?.value || '123 ถนนทดสอบ',
                deliveryNote: document.getElementById('deliveryNote')?.value || ''
            };

            order = {
                id: Date.now(),
                items: [...this.cart],
                customer: customerInfo,
                paymentMethod: this.paymentMethod || 'cash',
                total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                date: new Date().toLocaleString('th-TH'),
                status: 'confirmed'
            };
            console.log('Created new order:', order);
        }

        // Generate and display receipt
        const receiptHTML = this.generateReceiptHTML(order);
        receipt.innerHTML = receiptHTML;
        console.log('Receipt rendered with content length:', receiptHTML.length);
    }

    generateReceiptHTML(order) {
        const storeName = 'ร้านขายน้ำแข็ง';
        const methodText = {
            cash: '💵 เงินสด',
            transfer: '🏦 โอนเงิน',
            promptpay: '📱 PromptPay'
        }[order.paymentMethod] || order.paymentMethod;

        const statusText = {
            confirmed: '✅ ยืนยันแล้ว',
            pending_payment: '⏳ รอตรวจสอบการชำระเงิน',
            preparing: '👨‍🍳 กำลังเตรียมสินค้า',
            ready: '🚚 พร้อมจัดส่ง',
            completed: '🎉 เสร็จสิ้น',
            cancelled: '❌ ยกเลิก'
        }[order.status] || order.status;

        const itemsHtml = order.items.map(i => `
            <div class="receipt-row">
                <span>${i.name} x${i.quantity}</span>
                <span>฿${i.price * i.quantity}</span>
            </div>
        `).join('');

        const slipHtml = order.paymentSlip ? `
            <div class="receipt-section">
                <h5>📎 หลักฐานการชำระเงิน</h5>
                <img src="${order.paymentSlip}" style="max-width:240px;border-radius:8px;border:1px solid #eee;margin-top:10px;" />
            </div>
        ` : '';

        return `
            <div class="receipt-card">
                <div class="receipt-header">
                    <h3>🧊 ${storeName}</h3>
                    <div class="receipt-meta">
                        <div>เลขที่ใบเสร็จ: <strong>${order.orderNumber || '#' + order.id}</strong></div>
                        <div>วันที่: ${order.date}</div>
                        <div>สถานะ: <span class="status-${order.status}">${statusText}</span></div>
                    </div>
                </div>

                <div class="receipt-section">
                    <h5>👤 ข้อมูลลูกค้า</h5>
                    <div class="receipt-row"><span>ชื่อ</span><span>${order.customer?.customerName || '-'}</span></div>
                    <div class="receipt-row"><span>เบอร์โทร</span><span>${order.customer?.customerPhone || '-'}</span></div>
                    <div class="receipt-row"><span>ที่อยู่จัดส่ง</span><span style="max-width:260px;text-align:right;">${order.customer?.deliveryAddress || '-'}</span></div>
                    ${order.customer?.deliveryNote ? `<div class="receipt-row"><span>หมายเหตุ</span><span style="max-width:260px;text-align:right;">${order.customer.deliveryNote}</span></div>` : ''}
                </div>

                <div class="receipt-section">
                    <h5>💳 การชำระเงิน</h5>
                    <div class="receipt-row"><span>ช่องทาง</span><span>${methodText}</span></div>
                    ${order.paymentMeta && order.paymentMeta.transferRef ? `<div class="receipt-row"><span>เลขอ้างอิง</span><span>${order.paymentMeta.transferRef}</span></div>` : ''}
                    <div class="receipt-row"><span>สถานะการชำระ</span><span>${order.paymentMeta?.verified ? '✅ ตรวจสอบแล้ว' : '⏳ รอตรวจสอบ'}</span></div>
                </div>

                <div class="receipt-section">
                    <h5>🛒 รายการสินค้า</h5>
                    ${itemsHtml}
                    <div class="receipt-total">
                        <span>ยอดรวมทั้งสิ้น</span>
                        <span>฿${order.total}</span>
                    </div>
                </div>

                ${slipHtml}

                <div class="receipt-section">
                    <h5>📋 ข้อมูลเพิ่มเติม</h5>
                    <div class="receipt-row"><span>หมายเลขคำสั่งซื้อ</span><span>${order.orderNumber || order.id}</span></div>
                    <div class="receipt-row"><span>เวลาสั่งซื้อ</span><span>${order.date}</span></div>
                </div>

                <div class="receipt-footer">
                    <div>ขอบคุณที่อุดหนุนร้าน 🧊</div>
                    <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
                        📞 ติดต่อเรา: 081-234-5678 | 🏠 ถนนทดสอบ แขวงทดสอบ
                    </div>
                </div>
            </div>
        `;
    }

    // Add order status checking functionality
    checkOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            return order.status;
        }
        return null;
    }

    updateOrderStatus(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            this.saveOrders();

            // Notify user if status changed to important states
            if (['confirmed', 'preparing', 'ready', 'completed'].includes(newStatus)) {
                this.notifyOrderStatusChange(orderId, newStatus);
            }

            return true;
        }
        return false;
    }

    notifyOrderStatusChange(orderId, newStatus) {
        const statusMessages = {
            confirmed: '✅ คำสั่งซื้อของคุณได้รับการยืนยันแล้ว',
            preparing: '👨‍🍳 กำลังเตรียมสินค้าสำหรับคุณ',
            ready: '🚚 สินค้าพร้อมจัดส่งแล้ว',
            completed: '🎉 คำสั่งซื้อเสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ'
        };

        const message = statusMessages[newStatus];
        if (message) {
            this.showToast(message, 'success');
        }
    }

    renderStepper() {
        const stepper = document.getElementById('checkoutStepper');
        if (!stepper) return;
        const steps = Array.from(stepper.querySelectorAll('.step'));
        const total = steps.length || 1;
        const current = Math.max(1, Math.min(this.checkoutStep, total));
        steps.forEach(el => {
            el.classList.remove('active', 'completed', 'current');
            const s = parseInt(el.getAttribute('data-step') || '0', 10);
            if (s < current) {
                el.classList.add('completed');
            } else if (s === current) {
                el.classList.add('current');
            }
        });
        // Update progress bar width
        const progress = total > 1 ? ((current - 1) / (total - 1)) * 100 : 0;
        stepper.style.setProperty('--progress', progress + '%');
    }

    async shareReceipt() {
        try {
            // Attempt to share using LIFF if available
            if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
                // Share a simple text with order info (for full image share need server or canvas export)
                const receiptContent = document.getElementById('receiptContent');
                const lines = receiptContent ? receiptContent.innerText.slice(0, 900) : 'ใบเสร็จการสั่งซื้อ';
                await liff.sendMessages([{ type: 'text', text: lines }]);
                this.showToast('แชร์ใบเสร็จไปยังแชทแล้ว');
            } else if (navigator.share) {
                await navigator.share({ title: 'ใบเสร็จการสั่งซื้อ', text: 'ขอบคุณสำหรับการสั่งซื้อ' });
            } else {
                this.showToast('อุปกรณ์ไม่รองรับการแชร์', 'info');
            }
        } catch (e) {
            console.error(e);
            this.showToast('ไม่สามารถแชร์ใบเสร็จได้', 'error');
        }
    }

    // Admin Product Management Functions
    renderAdminProducts() {
        const productsManagement = document.getElementById('productsManagement');
        if (!productsManagement) {
            return;
        }
        
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
        if (!modal || !title || !form) {
            return;
        }
        
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
        const modal = document.getElementById('adminProductModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingProduct = null;
        const form = document.getElementById('adminProductForm');
        if (form) {
            form.reset();
        }
        const preview = document.getElementById('previewImg');
        if (preview) {
            preview.style.display = 'none';
        }
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
        if (!ordersList) return;

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
                            <button class="confirm-btn" onclick="app.adminConfirmOrder(${order.id})">
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

    renderUserOrders() {
        console.log('📋 Rendering user orders...');
        console.log('📦 Total orders:', this.orders.length);
        
        const userOrdersList = document.getElementById('userOrdersList');
        if (!userOrdersList) {
            console.log('❌ userOrdersList element not found');
            return;
        }

        // Filter orders by current user
        const userOrders = this.orders.filter(order =>
            !this.currentUser || order.userId === this.currentUser.userId || order.userId === 'guest'
        );
        
        console.log('👤 User orders:', userOrders.length);
        if (userOrders.length > 0) {
            console.log('📝 First order:', userOrders[0]);
        }

        if (userOrders.length === 0) {
            userOrdersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>ยังไม่มีคำสั่งซื้อ</h3>
                    <p>คำสั่งซื้อของคุณจะแสดงที่นี่</p>
                </div>
            `;
        } else {
            userOrdersList.innerHTML = userOrders.map(order => `
                <div class="user-order-card" data-order-id="${order.id}">
                    <div class="order-card-header">
                        <div class="order-info">
                            <h4>คำสั่งซื้อ ${order.orderNumber || '#' + order.id}</h4>
                            <p class="order-date">${order.date}</p>
                        </div>
                        <div class="order-status-badge status-${order.status}">
                            ${this.getStatusText(order.status)}
                        </div>
                    </div>

                    <div class="order-card-body">
                        <div class="order-items-summary">
                            ${order.items.map(item => `
                                <div class="order-item-summary">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>฿${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total-summary">
                            <span>ยอดรวม</span>
                            <span>฿${order.total}</span>
                        </div>
                    </div>

                    <div class="order-card-actions">
                        <button class="btn-track" onclick="app.showOrderTracking(${order.id})" style="color: #333; font-size: 14px;">
                            <i class="fas fa-map-marker-alt"></i> ติดตาม
                        </button>
                        <button class="btn-details" onclick="app.showOrderDetails(${order.id})" style="color: #333; font-size: 14px;">
                            <i class="fas fa-eye"></i> รายละเอียด
                        </button>
                        <button class="btn-receipt" onclick="app.printOrderReceipt(${order.id})" style="color: #333; font-size: 14px;">
                            <i class="fas fa-print"></i> ใบเสร็จ
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showToast('ไม่พบข้อมูลคำสั่งซื้อ', 'error');
            return;
        }

        const itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>${item.name} x${item.quantity}</span>
                <span>฿${item.price * item.quantity}</span>
            </div>
        `).join('');

        const detailsHtml = `
            <div style="text-align: left;">
                <h4>📋 รายละเอียดคำสั่งซื้อ ${order.orderNumber || '#' + order.id}</h4>
                <div style="margin: 15px 0;">
                    <strong>วันที่สั่ง:</strong> ${order.date}<br>
                    <strong>สถานะ:</strong> ${this.getStatusText(order.status)}<br>
                    <strong>วิธีชำระ:</strong> ${this.getPaymentMethodName()}<br>
                    <strong>ยอดรวม:</strong> ฿${order.total}
                </div>

                <h5>🛒 รายการสินค้า</h5>
                ${itemsHtml}

                <h5 style="margin-top: 15px;">👤 ข้อมูลลูกค้า</h5>
                <div style="margin: 10px 0;">
                    <strong>ชื่อ:</strong> ${order.customer.customerName}<br>
                    <strong>เบอร์โทร:</strong> ${order.customer.customerPhone}<br>
                    <strong>ที่อยู่:</strong> ${order.customer.deliveryAddress}
                    ${order.customer.deliveryNote ? `<br><strong>หมายเหตุ:</strong> ${order.customer.deliveryNote}` : ''}
                </div>
            </div>
        `;

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'รายละเอียดคำสั่งซื้อ',
                html: detailsHtml,
                width: '600px',
                confirmButtonText: 'ปิด'
            });
        } else {
            alert(`รายละเอียดคำสั่งซื้อ:\n\n${detailsHtml.replace(/<[^>]*>/g, '')}`);
        }
    }

    printOrderReceipt(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showToast('ไม่พบข้อมูลคำสั่งซื้อ', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateReceiptHTML(order));
        printWindow.document.close();
        printWindow.print();
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
    adminConfirmOrder(orderId) {
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
        if (!loading) return;
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        console.log('showToast called:', message, type);

        // Use SweetAlert2 if available, fallback to toast or alert
        if (typeof Swal !== 'undefined') {
            const toastConfig = {
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            };

            switch(type) {
                case 'success':
                    toastConfig.icon = 'success';
                    toastConfig.title = message;
                    break;
                case 'error':
                    toastConfig.icon = 'error';
                    toastConfig.title = message;
                    break;
                case 'warning':
                    toastConfig.icon = 'warning';
                    toastConfig.title = message;
                    break;
                case 'info':
                    toastConfig.icon = 'info';
                    toastConfig.title = message;
                    break;
                default:
                    toastConfig.icon = 'info';
                    toastConfig.title = message;
            }

            Swal.fire(toastConfig);
        } else {
            // Fallback to original toast system
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            if (!toast || !toastMessage) {
                console.log('Toast elements not found, using alert:', message);
                alert(message);
                return;
            }

            toastMessage.textContent = message;

            // Set toast type
            toast.className = 'toast show';
            if (type === 'error') {
                toast.style.background = '#dc3545';
            } else if (type === 'info') {
                toast.style.background = '#17a2b8';
            } else if (type === 'warning') {
                toast.style.background = '#ffc107';
            } else {
                toast.style.background = '#28a745';
            }

            console.log('Toast displayed');

            // Auto hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // Add order tracking functionality
    showOrderTracking(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showToast('ไม่พบข้อมูลคำสั่งซื้อ', 'error');
            return;
        }

        const statusSteps = [
            { status: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', icon: '✅' },
            { status: 'preparing', label: 'กำลังเตรียมสินค้า', icon: '👨‍🍳' },
            { status: 'ready', label: 'พร้อมจัดส่ง', icon: '🚚' },
            { status: 'completed', label: 'เสร็จสิ้น', icon: '🎉' }
        ];

        const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

        let trackingHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3>📋 ติดตามคำสั่งซื้อ ${order.orderNumber}</h3>
                <p>สถานะล่าสุด: ${this.getStatusText(order.status)}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
        `;

        statusSteps.forEach((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            trackingHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-radius: 8px; background: ${isCompleted ? '#d4edda' : isCurrent ? '#fff3cd' : '#f8f9fa'}; border: 1px solid ${isCompleted ? '#c3e6cb' : isCurrent ? '#ffeaa7' : '#dee2e6'};">
                    <div style="font-size: 1.5rem;">${step.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: ${isCurrent ? 'bold' : 'normal'}; color: ${isCompleted ? '#155724' : isCurrent ? '#856404' : '#6c757d'};">${step.label}</div>
                        ${isCurrent ? `<div style="font-size: 0.9rem; color: #856404;">กำลังดำเนินการ...</div>` : ''}
                    </div>
                    ${isCompleted ? '<div style="color: #28a745; font-weight: bold;">✓</div>' : ''}
                </div>
            `;
        });

        trackingHTML += `
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4>📦 รายละเอียดคำสั่งซื้อ</h4>
                <p><strong>วันที่สั่ง:</strong> ${order.date}</p>
                <p><strong>ยอดรวม:</strong> ฿${order.total}</p>
                <p><strong>วิธีชำระ:</strong> ${this.getPaymentMethodName()}</p>
            </div>
        `;

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'ติดตามคำสั่งซื้อ',
                html: trackingHTML,
                width: '600px',
                showConfirmButton: true,
                confirmButtonText: 'ปิด',
                customClass: {
                    popup: 'order-tracking-modal'
                }
            });
        } else {
            // Fallback modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 10000; display: flex;
                align-items: center; justify-content: center;
            `;
            modal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                    ${trackingHTML}
                    <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #ff8c00; color: white; border: none; border-radius: 5px; cursor: pointer;">ปิด</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

}
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OrderingApp();
});
