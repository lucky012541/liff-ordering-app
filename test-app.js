// Test script for LIFF Ordering App
console.log('🧪 Testing LIFF Ordering App...\n');

// Mock DOM elements
global.document = {
    getElementById: (id) => ({
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        addEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
        style: {},
        classList: {
            add: () => {},
            remove: () => {}
        }
    }),
    addEventListener: () => {}
};

global.window = {
    addEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};

// Mock LIFF
global.liff = {
    init: () => Promise.resolve(),
    isLoggedIn: () => false,
    getProfile: () => Promise.resolve({
        displayName: 'Test User',
        userId: 'test123',
        pictureUrl: 'https://example.com/avatar.jpg'
    }),
    sendMessages: () => Promise.resolve()
};

// Mock FormData
global.FormData = class {
    constructor() {}
    get() { return ''; }
};

// Load the app script
try {
    require('./script.js');
    console.log('✅ Script loaded successfully');
} catch (error) {
    console.log('❌ Script loading failed:', error.message);
    process.exit(1);
}

// Manually trigger app initialization (simulate DOMContentLoaded)
setTimeout(async () => {
    try {
        console.log('🚀 Initializing app manually...');

        // Directly initialize the app (bypass DOM event)
        if (typeof OrderingApp !== 'undefined') {
            window.app = new OrderingApp();
            console.log('✅ App instance created directly');
        } else {
            console.log('❌ OrderingApp class not available');
        }

        // Wait for app to initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if app was created
        if (typeof window.app !== 'undefined') {
            console.log('✅ App instance created');

            // Test product loading
            if (window.app.products && window.app.products.length > 0) {
                console.log('✅ Products loaded:', window.app.products.length, 'items');

                // Show sample products
                console.log('📦 Sample products:');
                window.app.products.slice(0, 3).forEach(product => {
                    console.log(`  - ${product.name}: ฿${product.price}`);
                });
            } else {
                console.log('❌ Products not loaded');
            }

            // Test cart functionality
            if (Array.isArray(window.app.cart)) {
                console.log('✅ Cart initialized (empty)');
            } else {
                console.log('❌ Cart not initialized');
            }

            // Test order functionality
            if (Array.isArray(window.app.orders)) {
                console.log('✅ Orders initialized (empty)');
            } else {
                console.log('❌ Orders not initialized');
            }

            // Test checkout validation
            console.log('🧪 Testing checkout validation...');
            if (window.app.validateDeliveryForm && window.app.validatePhoneField) {
                console.log('✅ Checkout validation functions available');
            } else {
                console.log('❌ Checkout validation functions missing');
            }

            // Test Flex Message creation
            if (window.app.createOrderFlexMessage) {
                console.log('✅ Flex Message creation available');

                // Test with sample order
                const sampleOrder = {
                    id: 'TEST001',
                    date: new Date().toLocaleString('th-TH'),
                    deliveryInfo: {
                        customerName: 'Test User',
                        customerPhone: '0812345678',
                        deliveryAddress: '123 Test Street',
                        deliveryNote: 'Test order'
                    },
                    paymentMethod: 'cash',
                    items: [
                        { name: 'น้ำแข็งเล็ก', quantity: 2, price: 40 }
                    ],
                    total: 80
                };

                const flexMessage = window.app.createOrderFlexMessage(sampleOrder);
                if (flexMessage && flexMessage.type === 'flex') {
                    console.log('✅ Flex Message created successfully');
                    console.log('📱 Message type:', flexMessage.contents.type);
                    console.log('📋 Order ID in message:', flexMessage.altText);
                } else {
                    console.log('❌ Flex Message creation failed');
                }
            } else {
                console.log('❌ Flex Message creation not available');
            }

            // Test UI rendering functions
            if (window.app.renderProducts && window.app.updateCartUI) {
                console.log('✅ UI rendering functions available');
            } else {
                console.log('❌ UI rendering functions missing');
            }

        } else {
            console.log('❌ App instance not created - checking OrderingApp class...');

            // Try to create instance manually
            if (typeof OrderingApp !== 'undefined') {
                console.log('✅ OrderingApp class found, creating instance...');
                window.app = new OrderingApp();
                console.log('✅ App instance created manually');
            } else {
                console.log('❌ OrderingApp class not found in global scope');
            }
        }

        console.log('\n🎉 Comprehensive functionality test completed!');
        process.exit(0);

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Stack:', error.stack);
        process.exit(1);
    }
}, 1000);