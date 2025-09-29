class OrderingTestBot {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.screenshots = [];
        this.isRunning = false;
        this.humanLikeDelay = {
            min: 500,
            max: 2000
        };
    }

    // Human-like delay simulation
    async humanDelay(customRange = null) {
        const range = customRange || this.humanLikeDelay;
        const delay = Math.random() * (range.max - range.min) + range.min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Take screenshot for error reporting
    async takeScreenshot(description) {
        try {
            const canvas = await html2canvas(document.body);
            const screenshot = {
                timestamp: new Date().toISOString(),
                description: description,
                dataUrl: canvas.toDataURL('image/png')
            };
            this.screenshots.push(screenshot);
            return screenshot;
        } catch (error) {
            console.warn('Screenshot failed:', error);
            return null;
        }
    }

    // Log test results
    logResult(step, status, error = null, screenshot = null) {
        const result = {
            step: step,
            status: status, // 'success', 'warning', 'error'
            timestamp: new Date().toISOString(),
            error: error,
            screenshot: screenshot
        };
        
        this.testResults.push(result);
        console.log(`[TEST BOT] ${step}: ${status}`, error || '');
        
        // Send to parent window if running in iframe
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'testResult',
                data: result
            }, '*');
        }
    }

    // Human-like element interaction
    async humanClick(element, description) {
        try {
            if (!element) {
                throw new Error(`Element not found: ${description}`);
            }

            // Simulate mouse movement and hover
            element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            await this.humanDelay({ min: 100, max: 300 });
            
            // Click with human-like behavior
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await this.humanDelay({ min: 50, max: 150 });
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            element.click();
            
            await this.humanDelay();
            this.logResult(`Click: ${description}`, 'success');
            return true;
        } catch (error) {
            const screenshot = await this.takeScreenshot(`Failed to click: ${description}`);
            this.logResult(`Click: ${description}`, 'error', error.message, screenshot);
            return false;
        }
    }

    // Human-like typing
    async humanType(element, text, description) {
        try {
            if (!element) {
                throw new Error(`Input element not found: ${description}`);
            }

            element.focus();
            element.value = '';
            
            // Type character by character with human-like delays
            for (let char of text) {
                element.value += char;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                await this.humanDelay({ min: 50, max: 200 });
            }
            
            element.dispatchEvent(new Event('change', { bubbles: true }));
            await this.humanDelay();
            
            this.logResult(`Type: ${description}`, 'success');
            return true;
        } catch (error) {
            const screenshot = await this.takeScreenshot(`Failed to type: ${description}`);
            this.logResult(`Type: ${description}`, 'error', error.message, screenshot);
            return false;
        }
    }

    // Test product selection
    async testProductSelection() {
        console.log('[TEST BOT] Starting product selection test...');
        
        // Test category filtering
        const categories = ['all', 'ice', 'water', 'gas'];
        for (let category of categories) {
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                await this.humanClick(categoryBtn, `Category: ${category}`);
                await this.humanDelay({ min: 1000, max: 2000 });
            }
        }

        // Test search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            await this.humanType(searchInput, 'น้ำ', 'Search for water products');
            await this.humanDelay({ min: 1500, max: 3000 });
            
            // Clear search
            await this.humanType(searchInput, '', 'Clear search');
            await this.humanDelay();
        }

        // Select random products
        const productCards = document.querySelectorAll('.product-card');
        if (productCards.length > 0) {
            const randomProducts = Array.from(productCards)
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(3, productCards.length));

            for (let product of randomProducts) {
                await this.humanClick(product, 'Product card');
                
                // Test product modal
                await this.testProductModal();
                await this.humanDelay({ min: 1000, max: 2000 });
            }
        } else {
            this.logResult('Product Selection', 'error', 'No products found on page');
        }
    }

    // Test product modal interactions
    async testProductModal() {
        const modal = document.getElementById('productModal');
        if (!modal || modal.style.display === 'none') {
            this.logResult('Product Modal', 'error', 'Modal not opened');
            return;
        }

        // Test quantity controls
        const increaseBtn = document.getElementById('increaseQty');
        const decreaseBtn = document.getElementById('decreaseQty');
        const quantitySpan = document.getElementById('modalQuantity');

        if (increaseBtn && decreaseBtn && quantitySpan) {
            // Increase quantity
            const randomIncreases = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < randomIncreases; i++) {
                await this.humanClick(increaseBtn, 'Increase quantity');
                await this.humanDelay({ min: 300, max: 800 });
            }

            // Decrease quantity (sometimes)
            if (Math.random() > 0.5) {
                await this.humanClick(decreaseBtn, 'Decrease quantity');
                await this.humanDelay({ min: 300, max: 800 });
            }
        }

        // Add to cart
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            await this.humanClick(addToCartBtn, 'Add to cart');
        }

        // Close modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            await this.humanClick(closeBtn, 'Close modal');
        }
    }

    // Test checkout process
    async testCheckoutProcess() {
        console.log('[TEST BOT] Starting checkout process test...');
        
        // Open checkout modal
        const checkoutBtn = document.getElementById('checkoutBtnMini') || 
                           document.getElementById('checkoutBtn');
        
        if (!checkoutBtn) {
            this.logResult('Checkout Process', 'error', 'Checkout button not found');
            return;
        }

        await this.humanClick(checkoutBtn, 'Open checkout');
        await this.humanDelay({ min: 1000, max: 2000 });

        // Test each checkout step
        await this.testCustomerInfoForm();
        await this.testPaymentSelection();
        await this.testOrderConfirmation();
    }

    // Test customer information form
    async testCustomerInfoForm() {
        const testData = {
            customerName: 'ทดสอบ บอท',
            customerPhone: '0812345678',
            deliveryAddress: '123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100',
            deliveryNote: 'หมายเหตุทดสอบ: โปรดส่งช่วงเช้า'
        };

        for (let [fieldId, value] of Object.entries(testData)) {
            const field = document.getElementById(fieldId);
            if (field) {
                await this.humanType(field, value, `Customer info: ${fieldId}`);
            }
        }

        // Proceed to next step
        const nextBtn = document.querySelector('.checkout-btn[onclick*="nextCheckoutStep"]');
        if (nextBtn) {
            await this.humanClick(nextBtn, 'Next step from customer info');
        }
    }

    // Test payment method selection
    async testPaymentSelection() {
        await this.humanDelay({ min: 1000, max: 2000 });

        const paymentMethods = ['cash', 'transfer', 'promptpay'];
        const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        const paymentRadio = document.querySelector(`input[name="paymentMethod"][value="${randomMethod}"]`);
        if (paymentRadio) {
            await this.humanClick(paymentRadio, `Payment method: ${randomMethod}`);
            
            // If transfer or promptpay, test file upload
            if (randomMethod !== 'cash') {
                await this.testFileUpload(randomMethod);
            }
        }

        // Proceed to next step
        const nextBtn = document.querySelector('.checkout-btn[onclick*="nextCheckoutStep"]');
        if (nextBtn) {
            await this.humanClick(nextBtn, 'Next step from payment');
        }
    }

    // Test file upload for payment slips
    async testFileUpload(paymentMethod) {
        const fileInputId = paymentMethod === 'transfer' ? 'transferSlip' : 'paymentSlip';
        const fileInput = document.getElementById(fileInputId);
        
        if (fileInput) {
            // Create a mock file
            const mockFile = new File(['mock image data'], 'test-slip.jpg', { type: 'image/jpeg' });
            
            try {
                // Simulate file selection
                Object.defineProperty(fileInput, 'files', {
                    value: [mockFile],
                    writable: false,
                });
                
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                this.logResult(`File upload: ${paymentMethod}`, 'success');
            } catch (error) {
                this.logResult(`File upload: ${paymentMethod}`, 'error', error.message);
            }
        }
    }

    // Test order confirmation
    async testOrderConfirmation() {
        await this.humanDelay({ min: 1000, max: 2000 });

        const confirmBtn = document.querySelector('.checkout-btn[onclick*="confirmOrder"]');
        if (confirmBtn) {
            await this.humanClick(confirmBtn, 'Confirm order');
        }
    }

    // Generate comprehensive test report
    generateReport() {
        const report = {
            testSession: {
                startTime: this.testResults[0]?.timestamp,
                endTime: this.testResults[this.testResults.length - 1]?.timestamp,
                totalSteps: this.testResults.length,
                successfulSteps: this.testResults.filter(r => r.status === 'success').length,
                errors: this.testResults.filter(r => r.status === 'error').length,
                warnings: this.testResults.filter(r => r.status === 'warning').length
            },
            detailedResults: this.testResults,
            screenshots: this.screenshots,
            summary: this.generateSummary()
        };

        return report;
    }

    // Generate summary of issues found
    generateSummary() {
        const errors = this.testResults.filter(r => r.status === 'error');
        const warnings = this.testResults.filter(r => r.status === 'warning');

        return {
            criticalIssues: errors.map(e => ({
                step: e.step,
                error: e.error,
                timestamp: e.timestamp,
                hasScreenshot: !!e.screenshot
            })),
            minorIssues: warnings.map(w => ({
                step: w.step,
                warning: w.error,
                timestamp: w.timestamp
            })),
            recommendations: this.generateRecommendations(errors, warnings)
        };
    }

    // Generate recommendations based on found issues
    generateRecommendations(errors, warnings) {
        const recommendations = [];

        if (errors.some(e => e.step.includes('Click'))) {
            recommendations.push('ตรวจสอบ element selectors และ event handlers');
        }

        if (errors.some(e => e.step.includes('Type'))) {
            recommendations.push('ตรวจสอบ input validation และ form handling');
        }

        if (errors.some(e => e.step.includes('Modal'))) {
            recommendations.push('ตรวจสอบ modal state management');
        }

        if (errors.some(e => e.step.includes('Checkout'))) {
            recommendations.push('ตรวจสอบ checkout flow และ form validation');
        }

        return recommendations;
    }

    // Run complete test suite
    async runFullTest() {
        if (this.isRunning) {
            console.log('[TEST BOT] Test already running...');
            return;
        }

        this.isRunning = true;
        this.testResults = [];
        this.screenshots = [];

        console.log('[TEST BOT] Starting comprehensive test suite...');

        try {
            await this.testProductSelection();
            await this.humanDelay({ min: 2000, max: 4000 });
            
            await this.testCheckoutProcess();
            await this.humanDelay({ min: 1000, max: 2000 });

        } catch (error) {
            this.logResult('Test Suite', 'error', `Unexpected error: ${error.message}`);
        }

        this.isRunning = false;
        
        const report = this.generateReport();
        console.log('[TEST BOT] Test completed. Report:', report);
        
        return report;
    }

    // Display report in console with formatting
    displayReport(report) {
        console.group('🤖 TEST BOT REPORT');
        console.log('📊 Test Summary:', report.testSession);
        console.log('❌ Critical Issues:', report.summary.criticalIssues);
        console.log('⚠️ Minor Issues:', report.summary.minorIssues);
        console.log('💡 Recommendations:', report.summary.recommendations);
        console.groupEnd();
    }
}

// Initialize test bot
const testBot = new OrderingTestBot();

// Add to global scope for manual testing
window.testBot = testBot;

console.log('🤖 Test Bot loaded. Use testBot.runFullTest() to start testing.');
