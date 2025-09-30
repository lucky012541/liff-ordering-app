# 📸 วิธีดูสลิปการชำระเงินของลูกค้า

## 🗄️ ที่เก็บสลิปการชำระเงิน

สลิปถูกเก็บใน **3 ที่** ภายใน Order Object:

```javascript
const order = {
    // ... ข้อมูลอื่นๆ
    
    // 1️⃣ Blob URL (ชั่วคราว - ใช้ในหน่วยความจำ)
    paymentSlip: "blob:http://localhost:8080/xxx-xxx-xxx",
    
    // 2️⃣ File Object (ชั่วคราว - ใช้ในหน่วยความจำ)
    paymentSlipFile: File,
    
    // 3️⃣ Base64 URL (ถาวร - บันทึกใน LocalStorage/GitHub) ⭐
    paymentMeta: {
        slipDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
        transferRef: "123ABC",
        verified: true
    }
};
```

### 🎯 สลิปที่เห็นจริงๆ คือ:

**`paymentMeta.slipDataUrl`** ← สลิปเป็น Base64 encoded image

---

## 🔍 วิธีดูสลิป (5 วิธี)

### 1️⃣ ผ่าน Browser Console (เร็วที่สุด)

**เปิด Console (F12) แล้ว paste:**

```javascript
// ดูคำสั่งซื้อทั้งหมด
const orders = JSON.parse(localStorage.getItem('liff_orders'));
console.log(orders);

// ดูสลิปของ order แรก
const order = orders[0];
console.log('💳 Payment Method:', order.paymentMethod);
console.log('📸 Slip URL:', order.paymentMeta.slipDataUrl);

// แสดงสลิปในหน้าจอ
if (order.paymentMeta.slipDataUrl) {
    const img = document.createElement('img');
    img.src = order.paymentMeta.slipDataUrl;
    img.style = 'max-width: 500px; border: 2px solid #00c300; border-radius: 8px;';
    document.body.appendChild(img);
}
```

---

### 2️⃣ ผ่าน Admin Panel (แนะนำ)

**เปิด Admin Panel:**
```
https://lucky012541.github.io/liff-ordering-app/adminpanel.html
```

**ขั้นตอน:**

1. ล็อกอิน: `admin` / `admin123`
2. แท็บ **"คำสั่งซื้อ"**
3. คลิก **"ดูรายละเอียด"** ที่คำสั่งซื้อที่ต้องการ
4. **เห็นสลิป** (ถ้ามี):
   - ชื่อ: มีนรญาณ์ พรหมเพชร
   - เลขบัญชี: 720-1-11288-5
   - 📸 **รูปสลิป**

**Code ใน Admin Panel ที่แสดงสลิป:**

```javascript
// ใน adminpanel.js
if (order.paymentMeta && order.paymentMeta.slipDataUrl) {
    html += `
        <div class="slip-preview">
            <h5>📸 สลิปการชำระเงิน</h5>
            <img src="${order.paymentMeta.slipDataUrl}" 
                 alt="Payment Slip" 
                 style="max-width: 100%; border-radius: 8px;">
        </div>
    `;
}
```

---

### 3️⃣ ผ่าน Application Tab (DevTools)

**เปิด DevTools (F12):**

1. **Application** tab
2. **Storage** → **Local Storage** → `https://lucky012541.github.io`
3. Key: `liff_orders`
4. คลิก **Value** → เห็น JSON ทั้งหมด
5. ค้นหา `"slipDataUrl"` → คัดลอก URL
6. Paste ใน Address Bar → เห็นรูปสลิป

**หรือคลิกขวา → Copy:**
```
Right-click on value 
→ Copy 
→ Paste in text editor
→ Search "slipDataUrl"
→ Copy URL starting with "data:image/png;base64,..."
→ Paste in new browser tab
```

---

### 4️⃣ ผ่าน GitHub Issues (ถ้าตั้งค่าแล้ว)

**เปิด GitHub Repository:**
```
https://github.com/lucky012541/my-orders-storage/issues
```

**ดูสลิป:**

1. เปิด Issue ที่ต้องการ
2. Scroll ลงมาที่ส่วน **"💳 การชำระเงิน"**
3. เห็น:
   ```markdown
   ## 💳 การชำระเงิน
   - **วิธีชำระ:** โอนเงิน
   - **หมายเลขอ้างอิง:** 123ABC
   - **สถานะ:** ตรวจสอบแล้ว ✅
   
   ### สลิปการโอนเงิน:
   ![Payment Slip](data:image/png;base64,...)
   ```
4. คลิกที่รูป → เห็นสลิปขนาดเต็ม

---

### 5️⃣ ผ่าน Script (สำหรับ Export)

**สร้าง Script ดึงสลิปทั้งหมด:**

```javascript
// Export all slips as files
const orders = JSON.parse(localStorage.getItem('liff_orders') || '[]');

orders.forEach((order, index) => {
    if (order.paymentMeta && order.paymentMeta.slipDataUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = order.paymentMeta.slipDataUrl;
        link.download = `slip_${order.orderNumber}.png`;
        link.click();
        
        console.log(`Downloaded slip for order ${order.orderNumber}`);
    }
});

console.log(`Exported ${orders.filter(o => o.paymentMeta?.slipDataUrl).length} slips`);
```

---

## 📊 โครงสร้างข้อมูลสลิป

### Base64 Image Format:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
│    │         │           │
│    │         │           └─ Encoded image data
│    │         └─ Encoding format
│    └─ MIME type
└─ Data URL prefix
```

### ข้อมูลที่เก็บพร้อมสลิป:

```javascript
paymentMeta: {
    transferRef: "123ABC",           // หมายเลขอ้างอิง
    slipDataUrl: "data:image/...",   // 📸 สลิป
    verified: true                    // ตรวจสอบแล้ว?
}
```

---

## 🔧 การตรวจสอบสลิป

### เช็คว่ามีสลิปหรือไม่:

```javascript
const orders = JSON.parse(localStorage.getItem('liff_orders') || '[]');

// Order ไหนมีสลิป?
orders.forEach(order => {
    const hasSlip = !!(order.paymentMeta && order.paymentMeta.slipDataUrl);
    console.log(`${order.orderNumber}: ${hasSlip ? '✅ มีสลิป' : '❌ ไม่มีสลิป'}`);
});

// นับจำนวน
const withSlip = orders.filter(o => o.paymentMeta?.slipDataUrl).length;
const withoutSlip = orders.length - withSlip;

console.log(`มีสลิป: ${withSlip} orders`);
console.log(`ไม่มีสลิป: ${withoutSlip} orders`);
```

---

## 📱 Admin Panel - ดูสลิปละเอียด

### Feature ที่ควรมี (ถ้ายังไม่มี):

```javascript
// ใน adminpanel.js
function showOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    let slipHTML = '';
    if (order.paymentMeta && order.paymentMeta.slipDataUrl) {
        slipHTML = `
            <div class="payment-slip-section">
                <h4>📸 สลิปการโอนเงิน</h4>
                
                <!-- Preview -->
                <div class="slip-preview">
                    <img src="${order.paymentMeta.slipDataUrl}" 
                         alt="Payment Slip"
                         onclick="openSlipFullscreen(this.src)"
                         style="max-width: 300px; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <p><small>คลิกเพื่อดูขนาดเต็ม</small></p>
                </div>
                
                <!-- Actions -->
                <div class="slip-actions">
                    <button onclick="downloadSlip('${order.orderNumber}', '${order.paymentMeta.slipDataUrl}')">
                        <i class="fas fa-download"></i> ดาวน์โหลด
                    </button>
                    <button onclick="verifySlip(${order.id})">
                        <i class="fas fa-check"></i> ยืนยันสลิป
                    </button>
                    <button onclick="rejectSlip(${order.id})">
                        <i class="fas fa-times"></i> ปฏิเสธ
                    </button>
                </div>
                
                <!-- Info -->
                <div class="slip-info">
                    <p><strong>หมายเลขอ้างอิง:</strong> ${order.paymentMeta.transferRef || '-'}</p>
                    <p><strong>สถานะ:</strong> ${order.paymentMeta.verified ? '✅ ตรวจสอบแล้ว' : '⏳ รอตรวจสอบ'}</p>
                </div>
            </div>
        `;
    }
    
    // แสดง modal
    Swal.fire({
        title: `คำสั่งซื้อ ${order.orderNumber}`,
        html: slipHTML + '...',
        width: '800px'
    });
}

// เปิดสลิปเต็มหน้าจอ
function openSlipFullscreen(src) {
    Swal.fire({
        imageUrl: src,
        imageAlt: 'Payment Slip',
        showCloseButton: true,
        showConfirmButton: false,
        width: '90%'
    });
}

// ดาวน์โหลดสลิป
function downloadSlip(orderNumber, dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `slip_${orderNumber}.png`;
    link.click();
}
```

---

## 🎯 ตัวอย่างการใช้งาน

### ดูสลิปคำสั่งซื้อล่าสุด:

```javascript
const orders = JSON.parse(localStorage.getItem('liff_orders'));
const lastOrder = orders[0];

console.log('Order:', lastOrder.orderNumber);
console.log('Customer:', lastOrder.customer.customerName);
console.log('Payment:', lastOrder.paymentMethod);

if (lastOrder.paymentMeta.slipDataUrl) {
    console.log('✅ มีสลิป');
    
    // แสดงในหน้าเว็บ
    const img = new Image();
    img.src = lastOrder.paymentMeta.slipDataUrl;
    img.onload = () => {
        console.log('Slip size:', img.width, 'x', img.height);
    };
} else {
    console.log('❌ ไม่มีสลิป (อาจเป็นเงินสด)');
}
```

---

## 📈 สถิติการชำระเงิน

### วิเคราะห์ข้อมูล:

```javascript
const orders = JSON.parse(localStorage.getItem('liff_orders') || '[]');

// นับตามวิธีชำระ
const stats = {
    cash: 0,
    transfer: 0,
    promptpay: 0,
    withSlip: 0,
    withoutSlip: 0
};

orders.forEach(order => {
    stats[order.paymentMethod]++;
    
    if (order.paymentMeta?.slipDataUrl) {
        stats.withSlip++;
    } else {
        stats.withoutSlip++;
    }
});

console.table(stats);

// Export CSV
const csv = orders.map(o => 
    `${o.orderNumber},${o.customer.customerName},${o.paymentMethod},${o.paymentMeta?.slipDataUrl ? 'มีสลิป' : 'ไม่มีสลิป'}`
).join('\n');

console.log('CSV Data:', csv);
```

---

## 🔒 ความปลอดภัยของสลิป

### ข้อควรระวัง:

1. **LocalStorage** ไม่เข้ารหัส
   - ใครก็ตามที่เข้าถึง browser ได้ → เห็นสลิป
   - แนะนำ: ล้างข้อมูลเก่าออกเป็นประจำ

2. **GitHub Issues** - Private Repo
   - ✅ ปลอดภัยกว่า
   - ต้องมี Token ถึงจะเข้าถึง

3. **Base64 Size**
   - รูป 1 MB → Base64 ~1.33 MB
   - LocalStorage limit: 5-10 MB
   - ควรบีบอัดรูปก่อนอัปโหลด

---

## 🎯 สรุป

### สลิปเก็บที่:

| ที่เก็บ | ตำแหน่ง | รูปแบบ | ถาวร? |
|--------|---------|--------|-------|
| **1. RAM** | `this.paymentSlipDataUrl` | Base64 | ❌ |
| **2. LocalStorage** | `order.paymentMeta.slipDataUrl` | Base64 | ⚠️ |
| **3. GitHub Issues** | Issue body | Base64 | ✅ |

### วิธีดู:

1. ✅ **Admin Panel** ← แนะนำ
2. ✅ **Console** ← เร็ว
3. ✅ **Application Tab** ← debug
4. ✅ **GitHub Issues** ← ถาวร
5. ✅ **Script Export** ← backup

### คำสั่งด่วน:

```javascript
// ดูสลิปทั้งหมด
JSON.parse(localStorage.getItem('liff_orders'))
    .filter(o => o.paymentMeta?.slipDataUrl)
    .forEach((o, i) => {
        console.log(`${i+1}. ${o.orderNumber}: ${o.paymentMethod}`);
    });
```

**สลิปทุกอันถูกเก็บไว้ใน `order.paymentMeta.slipDataUrl` เป็น Base64!** 📸
