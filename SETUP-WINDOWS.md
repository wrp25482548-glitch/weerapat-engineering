# ขั้นตอนเปิดระบบหลังบ้านบน Windows

ระบบนี้ต้องใช้ Node.js 22.13 ขึ้นไปและอินเทอร์เน็ตสำหรับดาวน์โหลด dependencies

```powershell
node --version
npm ci
npm run db:generate
npm run build
npm run dev
```

เมื่อ Dev Server ทำงาน ให้เปิดลิงก์ที่ Terminal แสดง แล้วเข้า `/signin-with-chatgpt?return_to=/admin` เพื่อจำลองการเข้าสู่ระบบ Local ก่อนเปิด `/admin`

สำหรับเว็บไซต์จริง ให้สร้างและเผยแพร่ผ่าน Sites แบบ Private ก่อน บัญชีแรกที่เข้าสู่ `/admin` จะถูกบันทึกเป็นเจ้าของ หลังจากนั้นจึงค่อยเพิ่มผู้เรียนหรือเปลี่ยนนโยบายการเข้าถึง
