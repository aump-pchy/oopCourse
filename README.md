# Java ฉบับลงมือทำ (31901-2006)

เว็บบทเรียน Java สำหรับ GitHub Pages: หน่วยที่ 1 ภาษาจาวาและเครื่องมือพัฒนา, หน่วยที่ 2 ตัวแปร ตัวดำเนินการ และการแปลงชนิดข้อมูล, หน่วยที่ 3 คำสั่งเลือกทำ if และ switch

## ขึ้น GitHub Pages
1. สร้าง repo ใหม่ (Public) เช่น `java-oop`
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ไว้ที่ root ของ repo
3. Settings > Pages > Source: Deploy from a branch > Branch: `main` / `(root)` > Save
4. รอ 1–2 นาที เว็บจะอยู่ที่ `https://<username>.github.io/java-oop/`

## ให้ Exit Ticket ส่งเข้า Google Form
หน้า Exit Ticket จะสร้างข้อความสรุปผลให้นักศึกษาคัดลอก ถ้าอยากให้มีปุ่มเปิดฟอร์มส่งงาน
ให้ใส่ลิงก์ Google Form ใน `data-form-url=""` ของแท็ก `<form class="exit" ...>` ใน `unit1.html`, `unit2.html` และ `unit3.html`
แนะนำให้ฟอร์มมีช่องเดียวแบบ Paragraph ให้นักศึกษาวางผลที่คัดลอกมา

## ใส่ภาพ mascot จาก GPT
วางไฟล์ภาพใน `assets/img/` แล้วใส่ `<img src="assets/img/ชื่อไฟล์.png" alt="คำอธิบายภาพ">` ตรงที่ต้องการ
ตอนนี้ใช้ mascot แบบ SVG ในโค้ด (ใน `assets/app.js`) ไปก่อน

## เพิ่มหน่วยใหม่
คัดลอก `unit2.html` เป็น `unit3.html` แก้เนื้อหา เปลี่ยน `data-checklist`, `data-progress`, `data-exit` เป็น `unit3`
แล้วเพิ่มลิงก์ใน `index.html` (คัดลอกบล็อก `<li>` ของหน่วยเดิม แก้ `data-unit-progress="unit3"`)

## หมายเหตุ
- ไม่มี backend ความคืบหน้าและผล Exit Ticket เก็บในเบราว์เซอร์ของนักศึกษาเท่านั้น
- interactive ทั้งหมดเป็น JavaScript ล้วน ไม่มี library ภายนอก ใช้แค่ Google Fonts
# oopCourse
