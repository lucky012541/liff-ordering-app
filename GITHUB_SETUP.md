# 🔧 คำแนะนำการตั้งค่า GitHub Storage

ระบบนี้ใช้ GitHub Issues API เพื่อเก็บข้อมูลคำสั่งซื้อแบบปลอดภัยใน Private Repository

## 📋 ขั้นตอนการตั้งค่า

### 1. สร้าง Private Repository

1. ไปที่ [GitHub](https://github.com) และเข้าสู่ระบบ
2. คลิก **"New repository"** หรือ **"+"** → **"New repository"**
3. ตั้งชื่อ Repository เช่น `my-orders-storage`
4. **สำคัญ:** เลือก **"Private"** เพื่อความปลอดภัย
5. คลิก **"Create repository"**

### 2. สร้าง Personal Access Token

1. ไปที่ **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. คลิก **"Generate new token"** → **"Generate new token (classic)"**
3. ตั้งชื่อ Token เช่น `Orders Storage Token`
4. เลือกสิทธิ์ที่จำเป็น:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **repo:status** (Access commit status)
   - ✅ **repo_deployment** (Access deployment status)
   - ✅ **public_repo** (Access public repositories)
   - ✅ **repo:invite** (Access repository invitations)
   - ✅ **security_events** (Read and write security events)

5. คลิก **"Generate token"**
6. **สำคัญ:** คัดลอกและเก็บ Token ไว้ (จะแสดงครั้งเดียว)

### 3. ตั้งค่าในแอปพลิเคชัน

1. เปิด **Admin Panel** → แท็บ **"GitHub"**
2. กรอกข้อมูล:
   - **Personal Access Token:** `ghp_xxxxxxxxxxxxxxxxxxxx`
   - **Username/Organization:** ชื่อ GitHub username ของคุณ
   - **Repository Name:** ชื่อ Repository ที่สร้างไว้

3. คลิก **"ทดสอบการเชื่อมต่อ"**
4. หากสำเร็จ คลิก **"บันทึกการตั้งค่า"**
5. คลิก **"ตั้งค่า Labels"** เพื่อสร้าง Labels สำหรับจัดการสถานะ

## 🏷️ Labels ที่จะถูกสร้าง

ระบบจะสร้าง Labels เหล่านี้โดยอัตโนมัติ:

### สถานะคำสั่งซื้อ:
- 🟡 **สถานะ: รอดำเนินการ** - คำสั่งซื้อใหม่
- 🟢 **สถานะ: ยืนยันแล้ว** - ยืนยันคำสั่งซื้อแล้ว
- 🔵 **สถานะ: กำลังจัดเตรียม** - กำลังเตรียมสินค้า
- 🟣 **สถานะ: จัดส่งแล้ว** - จัดส่งสินค้าแล้ว
- 🟢 **สถานะ: ส่งมอบแล้ว** - ลูกค้าได้รับสินค้าแล้ว
- 🔴 **สถานะ: ยกเลิก** - ยกเลิกคำสั่งซื้อ

### วิธีการชำระเงิน:
- 🟨 **ชำระเงิน: เงินสด** - เงินสดปลายทาง
- 🔷 **ชำระเงิน: โอนเงิน** - โอนผ่านธนาคาร
- 🌸 **ชำระเงิน: PromptPay** - ชำระผ่าน PromptPay

## 📊 ข้อมูลที่เก็บใน GitHub Issues

แต่ละคำสั่งซื้อจะถูกสร้างเป็น GitHub Issue ที่มีข้อมูล:

```markdown
## 📋 ข้อมูลคำสั่งซื้อ

**🆔 หมายเลขคำสั่งซื้อ:** 1640123456789
**📅 วันที่สั่งซื้อ:** 28/9/2025 18:00:00
**💰 ยอดรวม:** ฿150

## 👤 ข้อมูลลูกค้า
- **ชื่อ:** นาย ทดสอบ ระบบ
- **เบอร์โทร:** 081-234-5678
- **ที่อยู่:** 123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100

## 🛒 รายการสินค้า
- น้ำแข็งหลอด x2 = ฿60
- น้ำดื่ม x3 = ฿90

## 💳 การชำระเงิน
- **วิธีชำระ:** เงินสดปลายทาง
```

## 🔒 ความปลอดภัย

### ✅ ข้อดี:
- **Private Repository:** ข้อมูลลูกค้าปลอดภัย ไม่เปิดเผยต่อสาธารณะ
- **Access Control:** ควบคุมการเข้าถึงผ่าน GitHub permissions
- **Backup:** ข้อมูลสำรองอัตโนมัติบน GitHub servers
- **Version Control:** ติดตามการเปลี่ยนแปลงทั้งหมด
- **Search & Filter:** ค้นหาและกรองข้อมูลได้ง่าย

### ⚠️ ข้อควรระวัง:
- **Token Security:** เก็บ Personal Access Token ให้ปลอดภัย
- **Repository Privacy:** ตรวจสอบให้แน่ใจว่าเป็น Private Repository
- **Token Permissions:** ให้สิทธิ์เฉพาะที่จำเป็น

## 🛠️ การจัดการคำสั่งซื้อ

### ผ่าน Admin Panel:
- ดูรายการคำสั่งซื้อทั้งหมด
- อัปเดตสถานะคำสั่งซื้อ
- เพิ่มความคิดเห็น
- ค้นหาคำสั่งซื้อ

### ผ่าน GitHub:
- ดู Issues ใน Repository
- ใช้ Labels กรองตามสถานะ
- เพิ่ม Comments
- ปิด Issues เมื่อเสร็จสิ้น

## 🚀 การใช้งาน

หลังจากตั้งค่าเสร็จแล้ว:

1. **ลูกค้าสั่งซื้อ** → ระบบสร้าง GitHub Issue อัตโนมัติ
2. **Admin ตรวจสอบ** → ดูใน Admin Panel หรือ GitHub
3. **อัปเดตสถานะ** → เปลี่ยน Labels ใน GitHub หรือ Admin Panel
4. **ติดตามงาน** → ใช้ GitHub Issues เป็น Task Management

## 📞 การแก้ไขปัญหา

### ❌ ไม่สามารถเชื่อมต่อได้:
- ตรวจสอบ Personal Access Token
- ตรวจสอบชื่อ Username และ Repository
- ตรวจสอบว่า Repository เป็น Private
- ตรวจสอบสิทธิ์ของ Token

### ❌ ไม่สามารถสร้าง Labels ได้:
- ตรวจสอบสิทธิ์ `repo` ของ Token
- ตรวจสอบว่ามีสิทธิ์เขียนใน Repository

### ❌ ไม่สามารถบันทึกคำสั่งซื้อได้:
- ตรวจสอบการเชื่อมต่อ Internet
- ตรวจสอบ Token ยังใช้งานได้
- ตรวจสอบ Repository ยังมีอยู่

## 🎯 ข้อแนะนำ

1. **สำรองข้อมูล:** ใช้ GitHub เป็นระบบสำรองหลัก แต่ยังคง LocalStorage เป็น fallback
2. **จัดการ Token:** ตั้งวันหมดอายุของ Token และต่ออายุเป็นระยะ
3. **ตรวจสอบสิทธิ์:** ให้สิทธิ์เฉพาะที่จำเป็นเท่านั้น
4. **Monitor Usage:** ติดตามการใช้งาน GitHub API เพื่อไม่เกิน Rate Limit

---

**🎉 เสร็จแล้ว!** ตอนนี้ระบบของคุณจะเก็บข้อมูลคำสั่งซื้อใน GitHub อย่างปลอดภัยแล้ว
