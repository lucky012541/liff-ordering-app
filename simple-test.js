// Simple test script to verify app functionality
console.log('🧪 Testing LIFF Ordering App functionality...');

// Test 1: Check if app loads
try {
    if (typeof OrderingApp !== 'undefined') {
        console.log('✅ OrderingApp class found');
    } else {
        console.log('❌ OrderingApp class not found');
    }
} catch (error) {
    console.log('❌ Error checking OrderingApp:', error.message);
}

// Test 2: Create app instance
let app;
try {
    app = new OrderingApp();
    console.log('✅ App instance created');
} catch (error) {
    console.log('❌ Error creating app instance:', error.message);
}

// Test 3: Check if products load
setTimeout(() => {
    try {
        if (app && app.products && app.products.length > 0) {
            console.log(`✅ Products loaded: ${app.products.length} items`);
            console.log('Sample products:', app.products.slice(0, 2).map(p => p.name));
        } else {
            console.log('❌ Products not loaded');
        }
    } catch (error) {
        console.log('❌ Error checking products:', error.message);
    }

    // Test 4: Check cart functionality
    try {
        if (app && app.cart !== undefined) {
            console.log('✅ Cart system initialized');
            const initialCartSize = app.cart.length;
            app.addToCart(1, 1);
            if (app.cart.length > initialCartSize) {
                console.log('✅ Add to cart works');
            } else {
                console.log('❌ Add to cart failed');
            }
        } else {
            console.log('❌ Cart system not found');
        }
    } catch (error) {
        console.log('❌ Error testing cart:', error.message);
    }

    // Test 5: Check order system
    try {
        if (app && app.orders !== undefined) {
            console.log('✅ Order system initialized');
        } else {
            console.log('❌ Order system not found');
        }
    } catch (error) {
        console.log('❌ Error checking orders:', error.message);
    }

    // Test 6: Check payment methods
    try {
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        if (paymentMethods.length > 0) {
            console.log(`✅ Payment methods found: ${paymentMethods.length}`);
        } else {
            console.log('❌ Payment methods not found');
        }
    } catch (error) {
        console.log('❌ Error checking payment methods:', error.message);
    }

    console.log('🎯 Test completed!');
}, 1000);