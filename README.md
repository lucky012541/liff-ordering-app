# LIFF Ordering App - แอปสั่งซื้อสินค้าสำหรับ LINE LIFF

แอปพลิเคชันสั่งซื้อสินค้าที่ออกแบบมาสำหรับใช้กับ LINE LIFF (LINE Front-end Framework) พร้อมฟีเจอร์ครบครันสำหรับการสั่งซื้อสินค้าออนไลน์

## ฟีเจอร์หลัก

- 🛍️ **แค็ตตาล็อกสินค้า** - แสดงรายการสินค้าพร้อมรูปภาพและรายละเอียด
- 🛒 **ตะกร้าสินค้า** - จัดการสินค้าในตะกร้า เพิ่ม/ลดจำนวน
- 📱 **Responsive Design** - รองรับการใช้งานบนมือถือและเดสก์ท็อป
- 🔍 **ค้นหาสินค้า** - ค้นหาสินค้าตามชื่อและคำอธิบาย
- 🏷️ **หมวดหมู่สินค้า** - แยกหมวดหมู่สินค้า (อาหาร, เครื่องดื่ม, ของหวาน)
- 📋 **ประวัติการสั่งซื้อ** - ดูประวัติคำสั่งซื้อทั้งหมด
- 💾 **Local Storage** - บันทึกข้อมูลในเครื่อง
- 🔔 **การแจ้งเตือน** - แสดงข้อความแจ้งเตือนเมื่อทำการสั่งซื้อ

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. เริ่มต้นเซิร์ฟเวอร์

```bash
npm start
```

หรือใช้ live-server สำหรับการพัฒนา:

```bash
npm run dev
```

### 3. เปิดเบราว์เซอร์

แอปจะเปิดอัตโนมัติที่ `http://localhost:3000`

## การตั้งค่า LINE LIFF

### 1. สร้าง LIFF App

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider และ Channel ใหม่
3. เพิ่ม LIFF App ใน Channel
4. ตั้งค่า Endpoint URL เป็น `https://yourdomain.com`

### 2. ตั้งค่า LIFF ID

แก้ไขไฟล์ `script.js` และ `index.html`:

```javascript
// ใช้ LIFF ID ที่ได้จาก LINE Developers Console
liff.init({ liffId: '2006986568-yjrOkKqm' }, () => {
    // LIFF initialized successfully
}, (err) => {
    console.error('LIFF initialization failed', err);
});
```

### 3. ตั้งค่า Domain

ใน LINE Developers Console:
- ตั้งค่า `https://yourdomain.com` เป็น Endpoint URL
- ตั้งค่า `https://yourdomain.com` เป็น Valid redirect URI

## โครงสร้างไฟล์

```
liffmeni/
├── index.html          # หน้าเว็บหลัก
├── styles.css          # ไฟล์ CSS
├── script.js           # ไฟล์ JavaScript หลัก
├── package.json        # ไฟล์ package.json
└── README.md          # ไฟล์คู่มือการใช้งาน
```

## ฟีเจอร์ที่รองรับ

### หน้าสินค้า
- แสดงรายการสินค้าทั้งหมด
- ค้นหาสินค้าตามชื่อและคำอธิบาย
- กรองสินค้าตามหมวดหมู่
- เพิ่มสินค้าลงตะกร้า
- ดูรายละเอียดสินค้าใน Modal

### หน้าตะกร้า
- แสดงสินค้าในตะกร้า
- เพิ่ม/ลดจำนวนสินค้า
- ลบสินค้าออกจากตะกร้า
- คำนวณยอดรวม
- สั่งซื้อสินค้า

### หน้าคำสั่งซื้อ
- แสดงประวัติการสั่งซื้อ
- แสดงสถานะคำสั่งซื้อ
- แสดงรายละเอียดคำสั่งซื้อ

## การปรับแต่ง

### เพิ่มสินค้าใหม่

แก้ไขไฟล์ `script.js` ในฟังก์ชัน `loadSampleData()`:

```javascript
{
    id: 11,
    name: 'ชื่อสินค้า',
    description: 'คำอธิบายสินค้า',
    price: 100,
    image: 'URL รูปภาพ',
    category: 'food', // 'food', 'drink', 'dessert'
    stock: 50
}
```

### เปลี่ยนหมวดหมู่สินค้า

แก้ไขใน `index.html`:

```html
<button class="category-btn" data-category="new_category">หมวดหมู่ใหม่</button>
```

### ปรับแต่งสไตล์

แก้ไขไฟล์ `styles.css` ตามต้องการ

## การ Deploy

### 1. Deploy บน Netlify

1. สร้าง repository บน GitHub
2. เชื่อมต่อกับ Netlify
3. ตั้งค่า Build command: `npm install`
4. ตั้งค่า Publish directory: `.`
5. ตั้งค่า Environment variables (ถ้ามี)

### 2. Deploy บน Vercel

1. ติดตั้ง Vercel CLI: `npm i -g vercel`
2. รันคำสั่ง: `vercel`
3. ตั้งค่า Domain และ Environment variables

### 3. Deploy บน GitHub Pages

1. สร้าง repository บน GitHub
2. เปิดใช้งาน GitHub Pages
3. ตั้งค่า Source เป็น `main` branch
4. ตั้งค่า Custom domain (ถ้าต้องการ)

## การทดสอบ

### ทดสอบบนมือถือ

1. เปิด Developer Tools (F12)
2. เปิด Device Toolbar (Ctrl+Shift+M)
3. เลือกอุปกรณ์มือถือที่ต้องการทดสอบ

### ทดสอบ LIFF

1. ใช้ LINE App บนมือถือ
2. สแกน QR Code หรือเปิด URL ผ่าน LINE
3. ทดสอบการล็อกอินและฟีเจอร์ต่างๆ

## การแก้ไขปัญหา

### LIFF ไม่ทำงาน

1. ตรวจสอบ LIFF ID ว่าถูกต้อง
2. ตรวจสอบ Domain ที่ตั้งค่าใน LINE Developers Console
3. ตรวจสอบ HTTPS (LIFF ต้องการ HTTPS)

### สินค้าไม่แสดง

1. ตรวจสอบ URL รูปภาพ
2. ตรวจสอบ Console สำหรับ Error
3. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

### ตะกร้าไม่บันทึก

1. ตรวจสอบ Local Storage ใน Browser
2. ตรวจสอบ Console สำหรับ Error
3. ลองล้าง Cache และทดสอบใหม่

## License

MIT License - ดูไฟล์ LICENSE สำหรับรายละเอียด

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาสร้าง Issue ใน GitHub Repository

---

**หมายเหตุ**: แอปนี้เป็นตัวอย่างสำหรับการพัฒนา สามารถปรับแต่งและขยายฟีเจอร์ได้ตามความต้องการ
