/**
 * GitHub Issues API Storage System
 * ระบบเก็บข้อมูลคำสั่งซื้อผ่าน GitHub Issues API
 * 
 * Features:
 * - เก็บคำสั่งซื้อเป็น GitHub Issues
 * - ใช้ Labels จัดหมวดหมู่สถานะ
 * - ปลอดภัยด้วย Private Repository
 * - มี Search และ Filter
 */

class GitHubStorage {
    constructor(config = {}) {
        this.token = config.token || localStorage.getItem('github_token') || '';
        this.owner = config.owner || localStorage.getItem('github_owner') || '';
        this.repo = config.repo || localStorage.getItem('github_repo') || '';
        this.apiUrl = 'https://api.github.com';
        
        // Labels สำหรับจัดการสถานะคำสั่งซื้อ
        this.labels = {
            pending: 'สถานะ: รอดำเนินการ',
            confirmed: 'สถานะ: ยืนยันแล้ว',
            processing: 'สถานะ: กำลังจัดเตรียม',
            shipped: 'สถานะ: จัดส่งแล้ว',
            delivered: 'สถานะ: ส่งมอบแล้ว',
            cancelled: 'สถานะ: ยกเลิก',
            cash: 'ชำระเงิน: เงินสด',
            transfer: 'ชำระเงิน: โอนเงิน',
            promptpay: 'ชำระเงิน: PromptPay'
        };
    }

    // ตั้งค่า GitHub credentials
    setCredentials(token, owner, repo) {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
        
        // บันทึกลง localStorage
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_owner', owner);
        localStorage.setItem('github_repo', repo);
    }

    // ตรวจสอบการตั้งค่า
    isConfigured() {
        return !!(this.token && this.owner && this.repo);
    }

    // สร้าง Headers สำหรับ API request
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    // ทดสอบการเชื่อมต่อ GitHub
    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/repos/${this.owner}/${this.repo}`, {
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                const repo = await response.json();
                return {
                    success: true,
                    message: `เชื่อมต่อสำเร็จกับ ${repo.full_name}`,
                    repo: repo
                };
            } else {
                return {
                    success: false,
                    message: `ไม่สามารถเชื่อมต่อได้: ${response.status} ${response.statusText}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `เกิดข้อผิดพลาด: ${error.message}`
            };
        }
    }

    // สร้าง Labels ในระบบ (รันครั้งแรกเท่านั้น)
    async setupLabels() {
        const results = [];
        
        for (const [key, name] of Object.entries(this.labels)) {
            try {
                const color = this.getLabelColor(key);
                const response = await fetch(`${this.apiUrl}/repos/${this.owner}/${this.repo}/labels`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        name: name,
                        color: color,
                        description: `Label สำหรับ ${name}`
                    })
                });
                
                if (response.status === 201) {
                    results.push(`✅ สร้าง label: ${name}`);
                } else if (response.status === 422) {
                    results.push(`ℹ️ Label มีอยู่แล้ว: ${name}`);
                } else {
                    results.push(`❌ ไม่สามารถสร้าง label: ${name}`);
                }
            } catch (error) {
                results.push(`❌ ข้อผิดพลาด: ${error.message}`);
            }
        }
        
        return results;
    }

    // กำหนดสี Label
    getLabelColor(key) {
        const colors = {
            pending: 'fbca04',      // เหลือง
            confirmed: '0e8a16',    // เขียว
            processing: '1d76db',   // น้ำเงิน
            shipped: '5319e7',      // ม่วง
            delivered: '28a745',    // เขียวเข้ม
            cancelled: 'd73a49',    // แดง
            cash: 'f9d71c',         // เหลืองทอง
            transfer: '0366d6',     // น้ำเงินเข้ม
            promptpay: 'e99695'     // ชมพู
        };
        return colors[key] || '7057ff';
    }

    // บันทึกคำสั่งซื้อเป็น GitHub Issue
    async saveOrder(order) {
        try {
            const title = `คำสั่งซื้อ #${order.id} - ${order.customer.customerName}`;
            const body = this.formatOrderBody(order);
            const labels = this.getOrderLabels(order);

            const response = await fetch(`${this.apiUrl}/repos/${this.owner}/${this.repo}/issues`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    title: title,
                    body: body,
                    labels: labels
                })
            });

            if (response.ok) {
                const issue = await response.json();
                console.log('✅ บันทึกคำสั่งซื้อสำเร็จ:', issue.number);
                return {
                    success: true,
                    issueNumber: issue.number,
                    url: issue.html_url
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ ไม่สามารถบันทึกคำสั่งซื้อได้:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // จัดรูปแบบเนื้อหา Issue
    formatOrderBody(order) {
        const items = order.items.map(item => 
            `- ${item.name} x${item.quantity} = ฿${item.price * item.quantity}`
        ).join('\n');

        return `## 📋 ข้อมูลคำสั่งซื้อ

**🆔 หมายเลขคำสั่งซื้อ:** ${order.id}
**📅 วันที่สั่งซื้อ:** ${order.date}
**💰 ยอดรวม:** ฿${order.total}

## 👤 ข้อมูลลูกค้า
- **ชื่อ:** ${order.customer.customerName}
- **เบอร์โทร:** ${order.customer.customerPhone}
- **ที่อยู่:** ${order.customer.deliveryAddress}
${order.customer.deliveryNote ? `- **หมายเหตุ:** ${order.customer.deliveryNote}` : ''}

## 🛒 รายการสินค้า
${items}

## 💳 การชำระเงิน
- **วิธีชำระ:** ${this.getPaymentMethodText(order.paymentMethod)}
${order.paymentMeta ? this.formatPaymentMeta(order.paymentMeta) : ''}

---
*สร้างโดยระบบสั่งซื้อออนไลน์*`;
    }

    // แปลงวิธีชำระเงิน
    getPaymentMethodText(method) {
        const methods = {
            cash: 'เงินสดปลายทาง',
            transfer: 'โอนเงินผ่านธนาคาร',
            promptpay: 'PromptPay'
        };
        return methods[method] || method;
    }

    // จัดรูปแบบข้อมูลการชำระเงิน
    formatPaymentMeta(meta) {
        let result = '';
        if (meta.transferRef) {
            result += `- **หมายเลขอ้างอิง:** ${meta.transferRef}\n`;
        }
        if (meta.slipDataUrl) {
            result += `- **สลิปการโอนเงิน:** [ดูสลิป](${meta.slipDataUrl})\n`;
        }
        return result;
    }

    // กำหนด Labels สำหรับคำสั่งซื้อ
    getOrderLabels(order) {
        const labels = [];
        
        // Label สถานะ
        if (order.status && this.labels[order.status]) {
            labels.push(this.labels[order.status]);
        } else {
            labels.push(this.labels.pending);
        }
        
        // Label วิธีชำระเงิน
        if (order.paymentMethod && this.labels[order.paymentMethod]) {
            labels.push(this.labels[order.paymentMethod]);
        }
        
        return labels;
    }

    // ดึงรายการคำสั่งซื้อทั้งหมด
    async getOrders(options = {}) {
        try {
            const params = new URLSearchParams({
                state: options.state || 'all',
                sort: options.sort || 'created',
                direction: options.direction || 'desc',
                per_page: options.perPage || 100
            });

            if (options.labels) {
                params.append('labels', options.labels);
            }

            const response = await fetch(
                `${this.apiUrl}/repos/${this.owner}/${this.repo}/issues?${params}`,
                { headers: this.getHeaders() }
            );

            if (response.ok) {
                const issues = await response.json();
                return issues.map(issue => this.parseOrderFromIssue(issue));
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ ไม่สามารถดึงข้อมูลคำสั่งซื้อได้:', error);
            return [];
        }
    }

    // แปลง GitHub Issue เป็นข้อมูลคำสั่งซื้อ
    parseOrderFromIssue(issue) {
        // Extract order ID from title
        const orderIdMatch = issue.title.match(/คำสั่งซื้อ #(\d+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : issue.number;

        // Parse status from labels
        const statusLabel = issue.labels.find(label => 
            label.name.startsWith('สถานะ:')
        );
        const status = statusLabel ? 
            Object.keys(this.labels).find(key => this.labels[key] === statusLabel.name) : 
            'pending';

        return {
            id: orderId,
            issueNumber: issue.number,
            title: issue.title,
            status: status,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            url: issue.html_url,
            labels: issue.labels.map(label => label.name),
            body: issue.body
        };
    }

    // อัปเดตสถานะคำสั่งซื้อ
    async updateOrderStatus(issueNumber, newStatus) {
        try {
            // ดึงข้อมูล Issue ปัจจุบัน
            const response = await fetch(
                `${this.apiUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
                { headers: this.getHeaders() }
            );

            if (!response.ok) {
                throw new Error(`ไม่พบคำสั่งซื้อ: ${response.statusText}`);
            }

            const issue = await response.json();
            
            // อัปเดต Labels
            const newLabels = issue.labels
                .filter(label => !label.name.startsWith('สถานะ:'))
                .map(label => label.name);
            
            if (this.labels[newStatus]) {
                newLabels.push(this.labels[newStatus]);
            }

            // ส่งคำขอ PATCH
            const updateResponse = await fetch(
                `${this.apiUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        labels: newLabels
                    })
                }
            );

            if (updateResponse.ok) {
                return { success: true };
            } else {
                throw new Error(`ไม่สามารถอัปเดตได้: ${updateResponse.statusText}`);
            }
        } catch (error) {
            console.error('❌ ไม่สามารถอัปเดตสถานะได้:', error);
            return { success: false, error: error.message };
        }
    }

    // เพิ่มความคิดเห็นในคำสั่งซื้อ
    async addComment(issueNumber, comment) {
        try {
            const response = await fetch(
                `${this.apiUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        body: comment
                    })
                }
            );

            if (response.ok) {
                return { success: true };
            } else {
                throw new Error(`ไม่สามารถเพิ่มความคิดเห็นได้: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ ไม่สามารถเพิ่มความคิดเห็นได้:', error);
            return { success: false, error: error.message };
        }
    }

    // ค้นหาคำสั่งซื้อ
    async searchOrders(query) {
        try {
            const response = await fetch(
                `${this.apiUrl}/search/issues?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}`,
                { headers: this.getHeaders() }
            );

            if (response.ok) {
                const result = await response.json();
                return result.items.map(issue => this.parseOrderFromIssue(issue));
            } else {
                throw new Error(`ไม่สามารถค้นหาได้: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ ไม่สามารถค้นหาได้:', error);
            return [];
        }
    }

    // สถิติคำสั่งซื้อ
    async getOrderStats() {
        try {
            const orders = await this.getOrders();
            const stats = {
                total: orders.length,
                pending: 0,
                confirmed: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            };

            orders.forEach(order => {
                if (stats.hasOwnProperty(order.status)) {
                    stats[order.status]++;
                }
            });

            return stats;
        } catch (error) {
            console.error('❌ ไม่สามารถดึงสถิติได้:', error);
            return null;
        }
    }
}

// Export สำหรับใช้งาน
window.GitHubStorage = GitHubStorage;

// สร้าง instance global
window.githubStorage = new GitHubStorage();

console.log('✅ GitHub Storage System โหลดเสร็จแล้ว');
