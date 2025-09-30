# 📊 ที่เก็บข้อมูลสลิปเงินและชื่อลูกค้า

## 🗄️ สรุปการเก็บข้อมูล

### 1. **LocalStorage (Browser)**
**ที่เก็บหลัก:** ข้อมูลชั่วคราวในเบราว์เซอร์

```javascript
localStorage.setItem('liff_orders', JSON.stringify(this.orders));
```

**ข้อมูลที่เก็บ:**
- ✅ คำสั่งซื้อทั้งหมด (`this.orders`)
- ✅ ตะกร้าสินค้า (`this.cart`)

**ข้อจำกัด:**
- ⚠️ ข้อมูลหายเมื่อล้าง browser cache
- ⚠️ ข้อมูลอยู่เฉพาะเบราว์เซอร์นั้น
- ⚠️ ไม่ sync ระหว่างอุปกรณ์

---

### 2. **GitHub Issues API (ถ้าตั้งค่าแล้ว)**
**ที่เก็บถาวร:** Private Repository

```javascript
// ใน github-storage.js
await githubStorage.createOrder(order);
```

**ข้อมูลที่เก็บ:**
- ✅ คำสั่งซื้อแต่ละรายการเป็น GitHub Issue
- ✅ ข้อมูลลูกค้าครบถ้วน
- ✅ สลิปเงิน (base64)

**การตั้งค่า:**
1. สร้าง Private Repository
2. สร้าง Personal Access Token
3. ตั้งค่าใน Admin Panel → GitHub

---

## 📋 โครงสร้างข้อมูล Order

```javascript
const order = {
    // 🆔 ข้อมูลคำสั่งซื้อ
    id: 1759209954649,                    // Timestamp
    orderNumber: "ORD-1759209954649-847", // หมายเลขคำสั่งซื้อ
    date: "30/9/2568 13:05:36",          // วันที่สั่ง
    status: "confirmed",                  // สถานะ
    
    // 👤 ข้อมูลลูกค้า
    customer: {
        customerName: "นายทดสอบ ระบบ",
        customerPhone: "081-234-5678",
        deliveryAddress: "123 ถนนทดสอบ...",
        deliveryNote: "หมายเหตุ (ถ้ามี)"
    },
    
    // 🛒 รายการสินค้า
    items: [
        {
            id: 1,
            name: "น้ำแข็งหลอด",
            price: 30,
            quantity: 2
        }
    ],
    
    // 💰 ข้อมูลการชำระเงิน
    total: 60,
    paymentMethod: "transfer", // cash, transfer, promptpay
    
    // 💳 ข้อมูลสลิปและการชำระ
    paymentMeta: {
        transferRef: "123ABC",              // หมายเลขอ้างอิง
        slipDataUrl: "data:image/png;base64,...", // 🖼️ สลิปเงิน (base64)
        verified: true                       // ตรวจสอบแล้ว?
    },
    
    paymentSlip: "blob:http://...",        // Blob URL (ชั่วคราว)
    paymentSlipFile: File,                 // File object
    
    // 👤 ข้อมูลผู้ใช้
    userId: "U1234567890abc"               // LINE User ID
};
```

---

## 🖼️ การเก็บสลิปเงิน

### 1. **ในหน่วยความจำ (RAM)**
```javascript
this.paymentSlipDataUrl = e.target.result;
// "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
```
- เก็บในตัวแปร `this.paymentSlipDataUrl`
- เป็น Base64 encoded string

### 2. **ใน LocalStorage**
```javascript
localStorage.setItem('liff_orders', JSON.stringify(this.orders));
```
- ข้อมูล order ทั้งหมดรวม `paymentMeta.slipDataUrl`
- เก็บในรูป Base64 string

### 3. **ใน GitHub Issues (ถ้าตั้งค่าแล้ว)**
```markdown
## 💳 การชำระเงิน
- **วิธีชำระ:** โอนเงิน
- **หมายเลขอ้างอิง:** 123ABC
- **สลิปการโอน:** [ดูสลิป](data:image/png;base64,...)
```

---

## 🔍 วิธีดูข้อมูลที่เก็บ

### 1. **ดูใน Browser Console:**
```javascript
// ดูคำสั่งซื้อทั้งหมด
console.log(JSON.parse(localStorage.getItem('liff_orders')));

// ดูคำสั่งซื้อแรก
const orders = JSON.parse(localStorage.getItem('liff_orders'));
console.log(orders[0]);

// ดูสลิปเงิน
console.log(orders[0].paymentMeta.slipDataUrl);
```

### 2. **ดูใน Application Tab:**
1. เปิด Browser DevTools (F12)
2. ไปที่ **Application** tab
3. **Storage** → **Local Storage** → `https://lucky012541.github.io`
4. ดู key: `liff_orders`

### 3. **ดูใน Admin Panel:**
1. เปิด `adminpanel.html`
2. แท็บ **"คำสั่งซื้อ"**
3. คลิกดูรายละเอียดแต่ละคำสั่งซื้อ
4. ดูสลิปเงิน (ถ้ามี)

### 4. **ดูใน GitHub Issues:**
1. เปิด GitHub Repository: `my-orders-storage`
2. ไปที่ **Issues** tab
3. แต่ละ Issue = 1 คำสั่งซื้อ
4. ข้อมูลลูกค้า + สลิปอยู่ใน Issue body

---

## 📊 ตารางสรุป

| ข้อมูล | LocalStorage | GitHub Issues | หน่วยความจำ |
|--------|--------------|---------------|-------------|
| **ชื่อลูกค้า** | ✅ | ✅ | ✅ |
| **เบอร์โทร** | ✅ | ✅ | ✅ |
| **ที่อยู่** | ✅ | ✅ | ✅ |
| **สลิปเงิน** | ✅ (Base64) | ✅ (Base64) | ✅ (Base64) |
| **รายการสินค้า** | ✅ | ✅ | ✅ |
| **ยอดรวม** | ✅ | ✅ | ✅ |
| **สถานะ** | ✅ | ✅ (Labels) | ✅ |
| **Sync ข้าม device** | ❌ | ✅ | ❌ |
| **ถาวร** | ⚠️ (จนล้าง cache) | ✅ | ❌ |

---

## 🔒 ความปลอดภัย

### LocalStorage:
- ⚠️ ข้อมูลเก็บในเครื่องผู้ใช้
- ⚠️ สามารถเข้าถึงได้ผ่าน JavaScript
- ⚠️ ไม่เข้ารหัส

### GitHub Issues:
- ✅ Private Repository
- ✅ ต้องมี Token ถึงจะเข้าถึงได้
- ✅ GitHub Authentication
- ✅ มี Audit log

---

## 🎯 แนะนำ

### สำหรับ Development:
```javascript
// ใช้ LocalStorage เท่านั้น
this.loginRequired = false;
```
- ข้อมูลเก็บใน browser
- ไม่ต้องตั้งค่า GitHub

### สำหรับ Production:
```javascript
// ใช้ทั้ง LocalStorage + GitHub
this.loginRequired = true;
```
- ตั้งค่า GitHub Storage
- ข้อมูลจะถูกส่งไป GitHub Issues
- มี backup ถาวร

---

## 📝 สรุป

**ข้อมูลลูกค้าและสลิปเงินเก็บใน:**

1. **หน่วยความจำ (RAM):**
   - `this.customerInfo` → ชื่อ, เบอร์, ที่อยู่
   - `this.paymentSlipDataUrl` → สลิปเงิน (Base64)

2. **LocalStorage:**
   - Key: `liff_orders`
   - Value: JSON array ของคำสั่งซื้อทั้งหมด
   - รวม: ลูกค้า + สลิป + สินค้า

3. **GitHub Issues (ถ้าตั้งค่า):**
   - แต่ละ Issue = 1 คำสั่งซื้อ
   - ข้อมูลครบถ้วน + ถาวร

**ขนาดข้อมูล:**
- สลิปเงิน (Base64): ~100-500 KB/รูป
- ข้อมูลลูกค้า: ~1 KB
- LocalStorage limit: 5-10 MB (ประมาณ 10-50 orders พร้อมสลิป)

**ข้อจำกัด:**
- LocalStorage จำกัดที่ ~5-10 MB
- ควรตั้งค่า GitHub Storage สำหรับการใช้งานจริง
- สลิปเงินเป็น Base64 ทำให้ขนาดใหญ่ขึ้น 33%
