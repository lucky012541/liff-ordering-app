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
            console.log('Starting app initialization...');
            
            // Wait for LIFF initialization to complete with timeout
            try {
                if (window.liffInitPromise) {
                    console.log('Waiting for LIFF initialization...');
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('LIFF initialization timeout')), 5000);
                    });
                    
                    await Promise.race([window.liffInitPromise, timeoutPromise])
                        .catch(error => {
                            console.warn('LIFF initialization issue:', error.message);
                            // Continue execution even if LIFF times out
                        });
                    
                    console.log('LIFF initialization completed or timed out');
                }
            } catch (liffError) {
                console.warn('Error waiting for LIFF:', liffError);
                // Continue execution even if LIFF fails
            }

            // Initialize LIFF
            try {
                await this.initializeLIFF();
                console.log('LIFF initialization successful');
            } catch (liffError) {
                console.warn('Error initializing LIFF:', liffError);
                // Continue execution even if LIFF fails
            }

            try {
                // Load sample data
                console.log('Loading sample data...');
                this.loadSampleData();
                console.log('Sample data loaded successfully');
            } catch (dataError) {
                console.error('Error loading data:', dataError);
                this.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล กำลังใช้ข้อมูลสำรอง', 'warning');
                // Use fallback data if loading fails
                this.useFallbackData();
                console.log('Fallback data loaded');
            }

            try {
                // Setup event listeners
                console.log('Setting up event listeners...');
                this.setupEventListeners();
                console.log('Event listeners set up successfully');
            } catch (eventError) {
                console.error('Error setting up event listeners:', eventError);
                // Continue execution even if event listeners fail
            }

            try {
                // Render initial content
                console.log('Rendering initial content...');
                
                // ตรวจสอบว่ามีองค์ประกอบ HTML ก่อนเรียกใช้งาน
                const productsGrid = document.getElementById('productsGrid');
                if (productsGrid) {
                    this.renderProducts();
                    console.log('Products rendered successfully');
                } else {
                    console.warn('Products grid element not found');
                }
                
                this.updateCartUI();
                console.log('Cart UI updated');
                
                const ordersContainer = document.getElementById('ordersContainer');
                if (ordersContainer) {
                    this.renderOrders();
                    console.log('Orders rendered successfully');
                } else {
                    console.warn('Orders container element not found');
                }
                
                // ตรวจสอบว่ามีองค์ประกอบ HTML ก่อนเรียกใช้งาน
                if (document.getElementById('adminProductsContainer')) {
                    this.renderAdminProducts();
                    console.log('Admin products rendered successfully');
                }
            } catch (renderError) {
                console.error('Error rendering content:', renderError);
                this.showToast('เกิดข้อผิดพลาดในการแสดงผล กรุณารีเฟรชหน้าจอ', 'error');
            }

            console.log('App initialization completed successfully');
            this.showLoading(false);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showToast('เกิดข้อผิดพลาดในการโหลดแอป กรุณาลองใหม่อีกครั้ง', 'error');
            this.showLoading(false);
        }
    }
    
    useFallbackData() {
        // Fallback data in case loading fails
        this.products = [
            {
                id: 1,
                name: 'น้ำแข็ง',
                description: 'น้ำแข็งก้อนเล็ก',
                price: 40,
                icon: 'fas fa-snowflake',
                category: 'ice',
                stock: 100
            },
            {
                id: 4,
                name: 'น้ำดื่ม',
                description: 'น้ำดื่มสะอาด',
                price: 15,
                icon: 'fas fa-tint',
                category: 'water',
                stock: 200
            }
        ];
    }

    async initializeLIFF() {
        return new Promise((resolve, reject) => {
            if (typeof liff === 'undefined') {
                // LIFF not available, use mock data
                console.warn('LIFF SDK not available, using mock data');
                this.currentUser = {
                    displayName: 'ผู้ใช้ทดสอบ',
                    userId: 'test_user_123',
                    pictureUrl: 'https://via.placeholder.com/50'
                };
                this.updateUserInfo();
                resolve();
                return;
            }

            try {
                // ใช้ค่า liffId จาก HTML
                const liffId = '2006986568-yjrOkKqm';
                console.log('Initializing LIFF with ID:', liffId);
                
                if (!liffId) {
                    console.error('No liffId available');
                    this.useMockUser();
                    resolve();
                    return;
                }
                
                // ตรวจสอบว่า LIFF ถูกเริ่มต้นแล้วหรือไม่โดยใช้ liff.getOS()
                try {
                    // ถ้าเรียก getOS ได้แสดงว่า LIFF ถูกเริ่มต้นแล้ว
                    liff.getOS();
                    console.log('LIFF already initialized, OS:', liff.getOS());
                    this.continueWithLiff(resolve);
                } catch (e) {
                    // ถ้าเรียก getOS ไม่ได้แสดงว่า LIFF ยังไม่ถูกเริ่มต้น
                    console.log('LIFF not initialized, initializing now...');
                    
                    liff.init({ liffId: liffId })
                        .then(() => {
                            console.log('LIFF initialized in script.js');
                            this.continueWithLiff(resolve);
                        })
                        .catch(error => {
                            console.error('Error initializing LIFF in script.js:', error);
                            this.useMockUser();
                            resolve();
                        });
                }
            } catch (error) {
                console.error('Error in LIFF initialization:', error);
                // Fallback to mock data
                this.useMockUser();
                resolve();
            }
        });
    }
    
    continueWithLiff(resolve) {
        try {
            // Check if running in LINE app
            if (liff.isInClient()) {
                // Running in LINE app
                liff.getProfile()
                    .then(profile => {
                        this.currentUser = profile;
                        this.updateUserInfo();
                        resolve();
                    })
                    .catch(error => {
                        console.error('Error getting LINE profile:', error);
                        // Fallback to mock data
                        this.useMockUser();
                        resolve();
                    });
            } else {
                // Not in LINE app
                if (liff.isLoggedIn()) {
                    liff.getProfile()
                        .then(profile => {
                            this.currentUser = profile;
                            this.updateUserInfo();
                            resolve();
                        })
                        .catch(error => {
                            console.error('Error getting LINE profile:', error);
                            // Fallback to mock data
                            this.useMockUser();
                            resolve();
                        });
                } else {
                    // Not logged in, try to login
                    try {
                        liff.login();
                    } catch (error) {
                        console.error('Error during LIFF login:', error);
                        // Fallback to mock data
                        this.useMockUser();
                        resolve();
                    }
                }
            }
        } catch (error) {
            console.error('Error in LIFF continuation:', error);
            // Fallback to mock data
            this.useMockUser();
            resolve();
        }
    }
    
    useMockUser() {
        console.warn('Using mock user data');
        this.currentUser = {
            displayName: 'ผู้ใช้ทดสอบ',
            userId: 'test_user_123',
            pictureUrl: 'https://via.placeholder.com/50'
        };
        this.updateUserInfo();
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

        // Load data from localStorage
        this.loadFromLocalStorage();
    }
    
    loadFromLocalStorage() {
        try {
            // Load cart from localStorage
            const savedCart = localStorage.getItem('liff_cart');
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    // Validate cart data
                    if (Array.isArray(parsedCart)) {
                        this.cart = parsedCart;
                    } else {
                        console.error('Invalid cart data format, resetting cart');
                        this.cart = [];
                        this.saveCart(); // Reset with empty cart
                    }
                } catch (parseError) {
                    console.error('Error parsing cart data:', parseError);
                    this.cart = [];
                    this.saveCart(); // Reset with empty cart
                }
            }

            // Load orders from localStorage
            const savedOrders = localStorage.getItem('liff_orders');
            if (savedOrders) {
                try {
                    const parsedOrders = JSON.parse(savedOrders);
                    // Validate orders data
                    if (Array.isArray(parsedOrders)) {
                        this.orders = parsedOrders;
                    } else {
                        console.error('Invalid orders data format, resetting orders');
                        this.orders = [];
                        this.saveOrders(); // Reset with empty orders
                    }
                } catch (parseError) {
                    console.error('Error parsing orders data:', parseError);
                    this.orders = [];
                    this.saveOrders(); // Reset with empty orders
                }
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // Initialize with empty arrays if loading fails
            this.cart = [];
            this.orders = [];
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

        // Admin modal controls (only if elements exist)
        const closeAdminModal = document.getElementById('closeAdminModal');
        if (closeAdminModal) {
            closeAdminModal.addEventListener('click', () => {
                this.closeAdminModal();
            });
        }

        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => {
                this.closeAdminModal();
            });
        }

        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.openAdminModal();
            });
        }

        const adminProductForm = document.getElementById('adminProductForm');
        if (adminProductForm) {
            adminProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        const productImage = document.getElementById('productImage');
        if (productImage) {
            productImage.addEventListener('change', (e) => {
                this.previewImage(e);
            });
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

        // Real-time form validation
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');
        const deliveryAddress = document.getElementById('deliveryAddress');
        const nextBtn = document.getElementById('nextBtn');

        const validateForm = () => {
            let isValid = true;

            // Validate name
            if (customerName && !customerName.value.trim()) {
                customerName.classList.add('error');
                customerName.classList.remove('valid');
                isValid = false;
            } else if (customerName) {
                customerName.classList.remove('error');
                customerName.classList.add('valid');
            }

            // Validate phone
            if (customerPhone) {
                const cleanPhone = customerPhone.value.replace(/\D/g, '');
                if (cleanPhone.length < 9 || cleanPhone.length > 11) {
                    customerPhone.classList.add('error');
                    customerPhone.classList.remove('valid');
                    isValid = false;
                } else {
                    customerPhone.classList.remove('error');
                    customerPhone.classList.add('valid');
                }
            }

            // Validate address
            if (deliveryAddress && !deliveryAddress.value.trim()) {
                deliveryAddress.classList.add('error');
                deliveryAddress.classList.remove('valid');
                isValid = false;
            } else if (deliveryAddress) {
                deliveryAddress.classList.remove('error');
                deliveryAddress.classList.add('valid');
            }

            // Update next button state and error messages
            if (nextBtn) {
                nextBtn.disabled = !isValid;
                nextBtn.style.opacity = isValid ? '1' : '0.5';
                nextBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';

                // Show/hide error messages
                const nameError = document.getElementById('nameError');
                const phoneError = document.getElementById('phoneError');
                const addressError = document.getElementById('addressError');

                if (nameError) {
                    nameError.textContent = customerName && !customerName.value.trim() ? 'กรุณากรอกชื่อ-นามสกุล' : '';
                    nameError.style.display = customerName && !customerName.value.trim() ? 'block' : 'none';
                }

                if (phoneError) {
                    const cleanPhone = customerPhone ? customerPhone.value.replace(/\D/g, '') : '';
                    phoneError.textContent = cleanPhone.length < 9 || cleanPhone.length > 11 ? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง' : '';
                    phoneError.style.display = cleanPhone.length < 9 || cleanPhone.length > 11 ? 'block' : 'none';
                }

                if (addressError) {
                    addressError.textContent = deliveryAddress && !deliveryAddress.value.trim() ? 'กรุณากรอกที่อยู่จัดส่ง' : '';
                    addressError.style.display = deliveryAddress && !deliveryAddress.value.trim() ? 'block' : 'none';
                }
            }
        };

        // Add input event listeners
        if (customerName) {
            customerName.addEventListener('input', validateForm);
        }

        if (customerPhone) {
            customerPhone.addEventListener('input', validateForm);
        }

        if (deliveryAddress) {
            deliveryAddress.addEventListener('input', validateForm);
        }

        // Initial validation
        validateForm();
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
        try {
            const productsGrid = document.getElementById('productsGrid');
            if (!productsGrid) return;

            // ใช้ requestAnimationFrame เพื่อการเรนเดอร์ที่ราบรื่นขึ้น
            window.requestAnimationFrame(() => {
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

                // ใช้ DocumentFragment เพื่อลดการ reflow
                const fragment = document.createDocumentFragment();
                const batchSize = 20; // จำนวนสินค้าต่อแบทช์

                // เรนเดอร์สินค้าแบบแบทช์
                this.renderProductBatch(filteredProducts, fragment, 0, batchSize, productsGrid);
            });
        } catch (error) {
            console.error('Error rendering products:', error);
            this.showToast('เกิดข้อผิดพลาดในการแสดงสินค้า', 'error');
        }
    }

    renderProductBatch(products, fragment, startIndex, batchSize, productsGrid) {
        try {
            // ถ้าเป็นแบทช์แรก ให้ล้างเนื้อหาเดิมก่อน
            if (startIndex === 0) {
                productsGrid.innerHTML = '';
            }

            const endIndex = Math.min(startIndex + batchSize, products.length);
            const batch = products.slice(startIndex, endIndex);
            
            // สร้าง HTML สำหรับแบทช์นี้
            const batchHTML = batch.map(product => `
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
            
            // เพิ่ม HTML ลงใน DOM
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = batchHTML;
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            
            productsGrid.appendChild(fragment);
            
            // ถ้ายังมีสินค้าเหลือ ให้เรนเดอร์แบทช์ถัดไป
            if (endIndex < products.length) {
                setTimeout(() => {
                    this.renderProductBatch(products, document.createDocumentFragment(), endIndex, batchSize, productsGrid);
                }, 10); // รอเวลาเล็กน้อยเพื่อไม่ให้ UI กระตุก
            }
        } catch (error) {
            console.error('Error rendering product batch:', error);
        }
    }

    getFilteredProducts() {
        try {
            // ใช้การแคชข้อมูลเพื่อเพิ่มประสิทธิภาพ
            const cacheKey = `${this.currentCategory}_${this.searchQuery}`;
            
            if (!this._filteredProductsCache) {
                this._filteredProductsCache = {};
            }
            
            // ล้างแคชเมื่อมีการเปลี่ยนแปลงข้อมูลสินค้า
            if (this._lastProductsUpdate && this._lastProductsUpdate !== this._productsLastUpdated) {
                this._filteredProductsCache = {};
                this._lastProductsUpdate = this._productsLastUpdated;
            }
            
            // ใช้ข้อมูลจากแคชถ้ามี
            if (!this._filteredProductsCache[cacheKey]) {
                const searchLower = this.searchQuery.toLowerCase();
                this._filteredProductsCache[cacheKey] = this.products.filter(product => {
                    const matchesCategory = this.currentCategory === 'all' || product.category === this.currentCategory;
                    const matchesSearch = product.name.toLowerCase().includes(searchLower) ||
                                        product.description.toLowerCase().includes(searchLower);
                    return matchesCategory && matchesSearch;
                });
            }
            
            return this._filteredProductsCache[cacheKey];
        } catch (error) {
            console.error('Error filtering products:', error);
            return [];
        }
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
        try {
            if (!productId) {
                console.error('Invalid product ID:', productId);
                this.showToast('ไม่สามารถเพิ่มสินค้าได้ ข้อมูลสินค้าไม่ถูกต้อง', 'error');
                return;
            }
            
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                console.error('Product not found:', productId);
                this.showToast('ไม่พบสินค้าที่ต้องการ', 'error');
                return;
            }
            
            if (!quantity || quantity <= 0) {
                console.error('Invalid quantity:', quantity);
                this.showToast('กรุณาระบุจำนวนสินค้าให้ถูกต้อง', 'error');
                return;
            }

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
        } catch (error) {
            console.error('Error adding product to cart:', error);
            this.showToast('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า', 'error');
        }
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
        let isValid = true;
        
        for (let field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                this.showToast(`กรุณากรอก${input.previousElementSibling.textContent}`, 'error');
                input.focus();
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
                input.classList.add('valid');
            }
        }
        
        // Validate phone number
        const phone = document.getElementById('customerPhone').value;
        const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
        if (cleanPhone.length < 9 || cleanPhone.length > 11) {
            this.showToast('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-11 หลัก)', 'error');
            document.getElementById('customerPhone').focus();
            document.getElementById('customerPhone').classList.add('error');
            isValid = false;
        }
        
        // Enable/disable next button based on form validity
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.disabled = !isValid;
        nextBtn.style.opacity = isValid ? '1' : '0.5';
        
        return isValid;
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

        try {
            // ส่ง Flex Message ก่อนยืนยันคำสั่งซื้อ (ในโหมดทดสอบจะข้ามขั้นตอนนี้)
            await this.sendOrderFlexMessage(order);
            
            this.orders.unshift(order);
            this.cart = [];
            this.saveCart();
            this.saveOrders();
            this.updateCartUI();
            this.renderOrders();
            this.closeCheckoutModal();
            this.switchTab('orders');
            
            this.showToast('บันทึกคำสั่งซื้อเรียบร้อย! หมายเลขคำสั่งซื้อ: ' + order.id, 'success');
        } catch (error) {
            console.error('Error confirming order:', error);
            this.showToast('เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง', 'error');
        }
    }

    async sendOrderFlexMessage(order) {
        try {
            this.showToast('กำลังส่งข้อมูลคำสั่งซื้อ...', 'info');

            // สร้าง Flex Message สำหรับคำสั่งซื้อ
            const flexMessage = this.createOrderFlexMessage(order);
            
            // ตรวจสอบว่ามี LIFF SDK หรือไม่
            if (window.liff && liff.isLoggedIn()) {
                // ส่ง Flex Message ผ่าน LIFF SDK
                await liff.sendMessages([flexMessage]);
                this.showToast('ส่งข้อมูลคำสั่งซื้อเข้าช่องแชทเรียบร้อย', 'success');
            } else {
                // ในโหมดทดสอบ ให้แสดงข้อมูลคำสั่งซื้อแทนการส่ง Flex Message
                console.log('Flex Message ที่จะส่ง:', flexMessage);
                this.showOrderDetails(order);
                this.showToast('โหมดทดสอบ: แสดงข้อมูลคำสั่งซื้อในคอนโซล', 'info');
            }
            
            return true; // ส่งคืนค่าเพื่อให้ confirmOrder ทำงานต่อได้
        } catch (error) {
            console.error('Error sending order message:', error);
            this.showToast('เกิดข้อผิดพลาดในการส่งข้อมูลคำสั่งซื้อ', 'error');
            throw error; // ส่งต่อข้อผิดพลาดเพื่อให้ confirmOrder จัดการต่อ
        }
    }

    showOrderDetails(order) {
        // แสดงรายละเอียดคำสั่งซื้อในโหมดทดสอบ
        console.log('Order details:', order);
        this.showToast('บันทึกคำสั่งซื้อเรียบร้อย', 'success');
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
                                            size: 'sm',
                                            color: '#666666',
                                            flex: 1,
                                            align: 'center'
                                        },
                                        {
                                            type: 'text',
                                            text: `฿${item.price * item.quantity}`,
                                            size: 'sm',
                                            color: '#FF8C00',
                                            weight: 'bold',
                                            flex: 2,
                                            align: 'end'
                                        }
                                    ],
                                    margin: 'xs',
                                    backgroundColor: '#F8F9FA',
                                    cornerRadius: 'sm',
                                    paddingAll: 'sm'
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
        try {
            const ordersList = document.getElementById('ordersList');
            if (!ordersList) return;

            // ใช้ requestAnimationFrame เพื่อการเรนเดอร์ที่ราบรื่นขึ้น
            window.requestAnimationFrame(() => {
                if (this.orders.length === 0) {
                    ordersList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-list-alt"></i>
                            <h3>ยังไม่มีคำสั่งซื้อ</h3>
                            <p>เริ่มสั่งซื้อสินค้าเพื่อดูประวัติการสั่งซื้อ</p>
                        </div>
                    `;
                } else {
                    // ใช้ DocumentFragment เพื่อลดการ reflow
                    const fragment = document.createDocumentFragment();
                    const batchSize = 10; // จำนวนออเดอร์ต่อแบทช์

                    // เรียงลำดับออเดอร์จากใหม่ไปเก่า
                    const sortedOrders = [...this.orders].sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    });

                    // เรนเดอร์ออเดอร์แบบแบทช์
                    this.renderOrderBatch(sortedOrders, fragment, 0, batchSize, ordersList);
                }
            });
        } catch (error) {
            console.error('Error rendering orders:', error);
            this.showToast('เกิดข้อผิดพลาดในการแสดงคำสั่งซื้อ', 'error');
        }
    }

    renderOrderBatch(orders, fragment, startIndex, batchSize, ordersList) {
        try {
            // ถ้าเป็นแบทช์แรก ให้ล้างเนื้อหาเดิมก่อน
            if (startIndex === 0) {
                ordersList.innerHTML = '';
            }

            const endIndex = Math.min(startIndex + batchSize, orders.length);
            const batch = orders.slice(startIndex, endIndex);
            
            // สร้าง HTML สำหรับแบทช์นี้
            batch.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-item';
                orderDiv.innerHTML = `
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
                `;
                
                fragment.appendChild(orderDiv);
            });
            
            ordersList.appendChild(fragment);
            
            // ถ้ายังมีออเดอร์เหลือ ให้เรนเดอร์แบทช์ถัดไป
            if (endIndex < orders.length) {
                setTimeout(() => {
                    this.renderOrderBatch(orders, document.createDocumentFragment(), endIndex, batchSize, ordersList);
                }, 10); // รอเวลาเล็กน้อยเพื่อไม่ให้ UI กระตุก
            }
        } catch (error) {
            console.error('Error rendering order batch:', error);
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
        try {
            localStorage.setItem('liff_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
            this.showToast('ไม่สามารถบันทึกข้อมูลตะกร้าสินค้าได้', 'warning');
        }
    }

    saveOrders() {
        try {
            localStorage.setItem('liff_orders', JSON.stringify(this.orders));
        } catch (error) {
            console.error('Error saving orders to localStorage:', error);
            this.showToast('ไม่สามารถบันทึกข้อมูลคำสั่งซื้อได้', 'warning');
        }
    }

    showLoading(show) {
        try {
            const loading = document.getElementById('loading');
            if (loading) {
                if (show) {
                    loading.classList.add('show');
                } else {
                    loading.classList.remove('show');
                }
            }
        } catch (error) {
            console.warn('Loading element not available:', error);
        }
    }

    showToast(message, type = 'success') {
        try {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');

            if (toast && toastMessage) {
                toastMessage.textContent = message;
                toast.className = `toast ${type}`;
                toast.classList.add('show');

                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            } else {
                console.log('Toast notification:', message);
            }
        } catch (error) {
            console.warn('Toast notification failed:', error);
            console.log('Toast message:', message);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing app...');
        window.app = new OrderingApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback: try to show error message
        try {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดแอป กรุณารีเฟรชหน้า</p>';
            }
        } catch (fallbackError) {
            console.error('Fallback error handling failed:', fallbackError);
        }
    }
});

// Handle LIFF errors (backup initialization)
window.addEventListener('load', () => {
    if (typeof liff !== 'undefined' && !window.liffInitialized) {
        liff.init({ liffId: '2006986568-yjrOkKqm' }, () => {
            console.log('Backup LIFF initialization successful');
            window.liffInitialized = true;
        }, (err) => {
            console.error('Backup LIFF initialization failed:', err);
            window.liffInitialized = false;
        });
    }
});
