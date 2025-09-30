# 🗄️ คู่มือตั้งค่าฐานข้อมูล GitHub Issues

## 📊 ภาพรวมระบบ

ระบบนี้ใช้ **GitHub Issues API** เป็นฐานข้อมูลถาวร:
- ✅ แต่ละคำสั่งซื้อ = 1 GitHub Issue
- ✅ เก็บข้อมูลครบถ้วน: ลูกค้า, สินค้า, สลิปเงิน
- ✅ มี Labels สำหรับจัดการสถานะ
- ✅ Private Repository - ปลอดภัย
- ✅ ย้อนหลังได้ทั้งหมด

---

## 🚀 ขั้นตอนการตั้งค่า (5 นาที)

### 1. สร้าง Private Repository

**เปิด:** https://github.com/new

**ตั้งค่า:**
```
Repository name: my-orders-storage
Description: ฐานข้อมูลคำสั่งซื้อ
Visibility: ✅ Private (สำคัญ!)
Initialize: ไม่ต้องเลือกอะไร
```

**คลิก:** Create repository

---

### 2. สร้าง Personal Access Token

**เปิด:** https://github.com/settings/tokens/new

**ตั้งค่า:**
```
Note: Orders Database Token
Expiration: No expiration (หรือ 90 days)

Select scopes:
✅ repo (ทั้งหมด)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events
```

**คลิก:** Generate token

**สำคัญ:** คัดลอก Token ทันที!
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 3. ตั้งค่าใน Admin Panel

**เปิด Admin Panel:**
```
https://lucky012541.github.io/liff-ordering-app/adminpanel.html
```

**ขั้นตอน:**

1. **ล็อกอิน:** `admin` / `admin123`

2. **ไปแท็บ "GitHub"**

3. **กรอกข้อมูล:**
   ```
   Personal Access Token: ghp_xxxxxxxxxxxxxxxxxxxx
   GitHub Username: lucky012541
   Repository Name: my-orders-storage
   ```

4. **คลิก "ทดสอบการเชื่อมต่อ"**
   - ต้องขึ้น: ✅ เชื่อมต่อสำเร็จ!

5. **คลิก "บันทึกการตั้งค่า"**

6. **คลิก "ตั้งค่า Labels"**
   - สร้าง labels อัตโนมัติสำหรับสถานะคำสั่งซื้อ

---

### 4. ทดสอบระบบ

**สั่งซื้อทดสอบ:**

1. เปิด: https://lucky012541.github.io/liff-ordering-app/
2. เพิ่มสินค้าใส่ตะกร้า
3. สั่งซื้อและยืนยัน
4. **เปิด Console (F12)** ดู logs:

```
💾 Saving order...
✅ Order saved with ID: 1759210000000
📤 Saving to GitHub Issues database...
✅ บันทึกลง GitHub สำเร็จ! Issue #1
```

**ตรวจสอบใน GitHub:**

```
https://github.com/lucky012541/my-orders-storage/issues
```

ควรเห็น:
- Issue #1: คำสั่งซื้อแรก
- Labels: สถานะ, วิธีชำระ
- ข้อมูลครบถ้วน

---

## 📊 โครงสร้างข้อมูลใน GitHub Issues

### Issue Title:
```
คำสั่งซื้อ ORD-1759210000000-123 - นายทดสอบ ระบบ
```

### Issue Body:
```markdown
# 📋 คำสั่งซื้อ ORD-1759210000000-123

## 📅 ข้อมูลทั่วไป
- **วันที่:** 30/9/2568 13:05:36
- **สถานะ:** ยืนยันแล้ว
- **ยอดรวม:** ฿150

## 👤 ข้อมูลลูกค้า
- **ชื่อ:** นายทดสอบ ระบบ
- **เบอร์โทร:** 081-234-5678
- **ที่อยู่:** 123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10100
- **หมายเหตุ:** ส่งช่วงเช้า
- **LINE User ID:** U1234567890abc

## 🛒 รายการสินค้า

| สินค้า | ราคา | จำนวน | รวม |
|--------|------|--------|-----|
| น้ำแข็งหลอด | ฿30 | x2 | ฿60 |
| น้ำดื่ม | ฿30 | x3 | ฿90 |

**ยอดรวมทั้งหมด:** ฿150

## 💳 การชำระเงิน
- **วิธีชำระ:** โอนเงิน
- **หมายเลขอ้างอิง:** 123ABC
- **สถานะ:** ตรวจสอบแล้ว ✅

### สลิปการโอนเงิน:
![Payment Slip](data:image/png;base64,iVBORw0KGgoAAAA...)

---
📱 สร้างจาก LIFF Ordering App
```

### Labels:
- 🟢 `สถานะ: ยืนยันแล้ว`
- 💰 `ชำระเงิน: โอนเงิน`

---

## 🔧 การทำงานของระบบ

### Flow การบันทึกข้อมูล:

```
[ผู้ใช้สั่งซื้อ]
       ↓
[บันทึก LocalStorage] ← ทันที
       ↓
[บันทึก GitHub Issues] ← Background (ไม่บล็อก)
       ↓
[สำเร็จ] → ได้ Issue Number
```

### Dual Storage System:

| Storage | จุดประสงค์ | ข้อดี | ข้อเสีย |
|---------|-----------|-------|---------|
| **LocalStorage** | Cache ชั่วคราว | เร็ว, ไม่ต้อง internet | หายเมื่อล้าง cache |
| **GitHub Issues** | Database ถาวร | ถาวร, sync ได้ | ต้องตั้งค่า, ต้อง internet |

---

## 🔍 การดึงข้อมูลกลับมา

### วิธีที่ 1: ผ่าน Admin Panel

```
adminpanel.html → แท็บ "คำสั่งซื้อ"
→ แสดงจาก LocalStorage + GitHub
```

### วิธีที่ 2: ผ่าน GitHub API

```javascript
// ดึงคำสั่งซื้อทั้งหมด
const orders = await githubStorage.getAllOrders();
console.log(orders);

// ดึงแค่ order ที่ยังไม่ส่ง
const pending = await githubStorage.getOrdersByStatus('pending');
```

### วิธีที่ 3: ผ่าน GitHub Web

```
https://github.com/lucky012541/my-orders-storage/issues
```

- ดูได้ทุก issue
- กรองตาม Label
- Search ตามชื่อลูกค้า
- Export เป็น CSV

---

## 🏷️ Labels ที่ใช้

### สถานะคำสั่งซื้อ:
- 🟡 `สถานะ: รอดำเนินการ` - คำสั่งซื้อใหม่
- 🟢 `สถานะ: ยืนยันแล้ว` - ยืนยันแล้ว
- 🔵 `สถานะ: กำลังจัดเตรียม` - เตรียมสินค้า
- 🟣 `สถานะ: จัดส่งแล้ว` - จัดส่งแล้ว
- ✅ `สถานะ: ส่งมอบแล้ว` - ลูกค้าได้รับแล้ว
- 🔴 `สถานะ: ยกเลิก` - ยกเลิกแล้ว

### วิธีการชำระเงิน:
- 💵 `ชำระเงิน: เงินสด`
- 🏦 `ชำระเงิน: โอนเงิน`
- 📱 `ชำระเงิน: PromptPay`

---

## 📈 ข้อดีของระบบ

### 1. ✅ ข้อมูลถาวร
- เก็บได้ไม่จำกัด
- ไม่หายแม้ล้าง browser
- Backup อัตโนมัติโดย GitHub

### 2. ✅ ค้นหาง่าย
```
# ค้นหาตามชื่อ
site:github.com/lucky012541/my-orders-storage "นายทดสอบ"

# กรองตามสถานะ
label:"สถานะ: รอดำเนินการ"

# กรองตามวิธีชำระ
label:"ชำระเงิน: โอนเงิน"
```

### 3. ✅ จัดการได้หลายคน
- เพิ่ม collaborators ใน repo
- แต่ละคนสามารถอัปเดตสถานะ
- มี audit log ว่าใครแก้อะไร

### 4. ✅ Export ข้อมูล
```bash
# Export เป็น JSON
gh issue list --repo lucky012541/my-orders-storage --json number,title,body,labels

# Export เป็น CSV
# ใช้ GitHub web → Export
```

### 5. ✅ API Access
```javascript
// สามารถเขียน script เพื่อ:
- สร้างรายงานประจำวัน
- แจ้งเตือนคำสั่งซื้อใหม่
- อัปเดตสถานะอัตโนมัติ
- วิเคราะห์ข้อมูล
```

---

## 🔒 ความปลอดภัย

### ✅ Private Repository
- เห็นได้เฉพาะคนที่มี access
- ไม่แชร์ข้อมูลลูกค้าสู่สาธารณะ

### ✅ Token Security
- Token เก็บใน localStorage
- ไม่ commit ลง Git
- แนะนำให้ตั้ง expiration

### ✅ Audit Log
- GitHub บันทึกทุก action
- รู้ว่าใครแก้ไขอะไร เมื่อไหร่

---

## 🚨 ข้อควรระวัง

### 1. ⚠️ API Rate Limit
- GitHub: 5,000 requests/hour
- เพียงพอสำหรับ 100-200 orders/hour

### 2. ⚠️ File Size
- สลิปเงิน Base64 ใหญ่
- แนะนำบีบอัดรูปก่อน upload
- หรือใช้ image hosting แยก

### 3. ⚠️ Network Dependency
- ต้องมี internet เพื่อบันทึก GitHub
- LocalStorage เป็น fallback

---

## 📊 สรุป

**ระบบ Dual Storage:**
```
LocalStorage (Fast Cache) → GitHub Issues (Permanent DB)
```

**ข้อมูลที่เก็บ:**
- ✅ ชื่อลูกค้า, เบอร์โทร, ที่อยู่
- ✅ รายการสินค้า, ราคา, จำนวน
- ✅ สลิปเงิน (Base64)
- ✅ สถานะคำสั่งซื้อ
- ✅ LINE User ID

**ย้อนหลังได้:**
- ✅ ทุกคำสั่งซื้อตั้งแต่เริ่มใช้ระบบ
- ✅ ประวัติการแก้ไขทั้งหมด
- ✅ Export ออกมาได้ทุกเมื่อ

---

## 🎯 Next Steps

1. ✅ ตั้งค่า GitHub Storage ตามขั้นตอนข้างบน
2. ✅ ทดสอบสั่งซื้อ
3. ✅ ตรวจสอบว่าข้อมูลบันทึกลง GitHub
4. ✅ เพิ่ม collaborators ถ้าต้องการ
5. ✅ ตั้งค่า backup schedule (optional)

**พร้อมใช้งานแล้ว!** 🚀
