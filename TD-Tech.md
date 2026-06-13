# 🛠️ Tournament Director (TD) - Technical Reference (TD-Tech.md)

ไฟล์นี้จัดทำขึ้นเพื่อบันทึกสถาปัตยกรรมระบบหลังบ้าน ข้อจำกัดทางเทคนิค (Technical Constraints) และวิธีแก้ไขบั๊กสำคัญที่พบระหว่างการพัฒนา เพื่อใช้เป็นคู่มืออ้างอิงสำหรับโปรเจกต์นี้และโปรเจกต์อื่น ๆ ในอนาคต

## หัวข้อ
---
### 1. *️⃣ 5. Technical Constraints
1. Node.js & ES Module System Standard
2. TypeScript Configuration & Runtime Execution Control
3. Prisma ORM Version 7.x Architectural Standard
4. Modern Programming Options with Express 5
5. Remote Connectivity & Network Tunneling (Digital Nomad Style)

### 2. ลำดับคำสั่งติดตั้ง (Execution Order) เพื่อสร้าง Server และแก้ไขปัญหาตามคู่มือ TD-Tech.md

### 3. 🛠️ เทคนิคการเชื่อมต่อฐานข้อมูลผ่านระบบมุดอุโมงค์ (Prisma 7 + SSH Tunnel)

---

## 1. Techincal Constrains x 5
### 📦 Technical Constraints: 1. Node.js & ES Module System Standard (.ts vs .js Constraint)
ในการตั้งไข่ระบบหลังบ้านด้วย Node.js ยุคปัจจุบัน การเลือกใช้ระบบโมดูลสากลมีความสำคัญอย่างมากต่อการเขียนโครงสร้างโค้ด

* **ปัญหาที่พบ (CommonJS vs ES Module):** 
  เกิดข้อผิดพลาด `ECMAScript imports cannot be written in a CommonJS file...` เมื่อพยายามใช้คำสั่ง `import / export` ยุคใหม่ในไฟล์ที่ลงท้ายด้วย `.ts` หรือ `.js`
* **สาเหตุเชิงโครงสร้าง:** 
  ค่าเริ่มต้นของ Node.js ที่ได้จากการรันคำสั่ง `npm init -y` จะกำหนดให้โปรเจกต์เดินตามระบบ **CommonJS** ยุคเก่า ซึ่งบังคับให้ใช้ไวยากรณ์แบบ `const express = require('express')`
* **วิธีแก้ไขรหัสกติกาหลัก:** 
  ต้องสลับระบบปฏิบัติการของโปรเจกต์ให้เป็น **ESModule (ยุคใหม่)** โดยการเข้าไปที่ไฟล์ `package.json` แล้วเพิ่มคำสั่งควบคุมลงไป:
```json
  "type": "module"
```
* ผลลัพธ์: ทำให้สามารถใช้คำสั่ง import / export ตามมาตรฐานโมดูลยุคปัจจุบันได้ทันที
#### ⚠️ [ข้อจำกัดเพิ่มเติม] สับสนเรื่องนามสกุลไฟล์: ทำไมเขียนไฟล์ .ts แต่ต้อง import เป็น .js?
* **Technical Constraint:** แม้ตัวไฟล์จริงในโฟลเดอร์พัฒนาของป๋าจะเป็น `src/prisma.ts` แต่ในโค้ดไวยากรณ์สั่งงาน ป๋าจำเป็นต้องเขียนเชื่อมโยงระบุเป็น `import { prisma } from './prisma.js'` (ห้ามใส่ .ts เด็ดขาด)
* **เหตุผลเบื้องหลัง:** ตัวคอมไพเลอร์ TypeScript (`tsc` หรือ `tsx`) จะไม่เข้าไปยุ่งหรือแก้ไขข้อความภายในคำสั่ง `import` ของป๋าเลย และเมื่อระบบแปลผล (Compile) โค้ดทั้งหมดจะถูกแปลงไปทำงานในฐานะไฟล์ JavaScript (`.js`) ภายใต้ระเบียบของระบบ ES Module ยุคใหม่ ซึ่งบังคับให้ต้องระบุนามสกุลไฟล์ผลลัพธ์ปลายทางให้ชัดเจนเพื่อป้องกันระบบหาไฟล์ไม่เจอ
---

### 💻 Technical Constraints: 2. TypeScript Configuration & Runtime Execution Control
เมื่อนำภาษา TypeScript (TS) มาฟิวชันร่วมกับระบบ Node.js (ES Modules) จะทำให้เกิดความขัดแย้งทางสายพันธุ์เล็กน้อยในหน้างานจริง ซึ่งมีแนวทางจัดระเบียบโครงสร้างระบบแยกเป็น 3 ส่วนสำคัญดังนี้:

#### 2.1 ระบบตัวแปลภาษาหลังบ้าน (Runtime Execution)
* **อาการของปัญหา:** สั่งรัน `nodemon src/server.ts` ในตอนแรกแล้วระบบระเบิดพ่นไฟสีแดงว่า `Unknown file extension ".ts"` เนื่องจาก Node.js ดั้งเดิมอ่านและประมวลผลไฟล์นามสกุล `.ts` ตรง ๆ ไม่เป็น
* **แนวทางแก้ไข:** ติดตั้งแพ็คเกจเครื่องมือที่ชื่อว่า `tsx` (TypeScript Execute) ลงในช่อง `devDependencies` เพื่อทำหน้าที่เป็น "หัวเทียนและวุ้นแปลภาษาอัตโนมัติ" ช่วยแปลงโค้ดระบบโมดูลยุคใหม่ให้กลายเป็น JavaScript ส่งให้ Node.js รันได้ทันทีโดยไม่ต้องสั่งสร้างไฟล์คอมไพล์แยกให้รกโฟลเดอร์
* **คำสั่งติดตั้งตัวแปลภาษา:**
```bash
npm install -D tsx
```
* ผลลัพธ์เมื่อติดตั้งสำเร็จ (ตรวจสอบที่ package.json/devDependencies):
```json
"devDependencies": {
  "tsx": "^4.22.3"
} 
```
#### 2.2 ระบบสคริปต์รันงานอัตโนมัติ (Automation Scripts)
สคริปต์สั่งงานสำหรับนักพัฒนาเพื่อสั่งให้ระบบเริ่มทำงานควบคู่กับการเปิดท่อแปลภาษา tsx และเฝ้าดูความเปลี่ยนแปลงของไฟล์ในโปรเจกต์

สคริปต์รันงานมาตรฐานประจำโปรเจกต์ (ใน package.json):
``` JSON
"scripts": {
    "dev": "nodemon --exec node --import tsx src/server.ts"
  }
```
* ความหมายลึกซึ้ง: สั่งคนเฝ้าบ้าน nodemon ให้คอยตรวจสอบความเปลี่ยนแปลงของไฟล์นามสกุล .ts และ .json หากป๋ากดเซฟโค้ดเมื่อไหร่ ให้เรียกเครื่องยนต์หลัก node ควบคู่กับการสวมตัวแปลภาษาใหม่อย่าง --import tsx เข้าไปช่วยอ่านไฟล์ src/server.ts ด่านหน้าใหม่อัตโนมัติทันที

#### 2.3 ระบบพจนานุกรมและตัวช่วยประเภทข้อมูล (Environment & Type Control)
* อาการของปัญหา: บนหน้าจอ VS Code มักจะขึ้นเส้นหยักสีแดงเตือนหลอกตา เช่น Cannot find name 'process' หรือเรียกคำสั่ง Express ไม่ผ่าน

* สาเหตุ: สมองกลหลังบ้านของ VS Code (Built-in TS Service) ยังขาดพจนานุกรมคำศัพท์และการระบุประเภทข้อมูลเฉพาะทางของฝั่ง Node.js และ Express API

* วิธีแก้ไขชุดคำสั่งพึ่งพา (Dependencies):
ทำการติดตั้งตัวช่วยแปลประเภทข้อมูลลงในช่อง devDependencies ด้วยคำสั่ง:
```Bash
npm install -D typescript @types/node
npx tsc --init
```
* ผลลัพธ์เมื่อติดตั้งสำเร็จ (ตรวจสอบที่ package.json/devDependencies):
```json
"devDependencies": {
  "@types/node": "^25.9.1",
} 
```
* ผลลัพธ์คลังข้อมูลหลังจากเซตอัปเสร็จสิ้น (package.json/devDependencies):
```json
"devDependencies": {
  "@types/express": "^5.0.6",
  "@types/node": "^25.9.1",
  "nodemon": "^3.1.14",
  "tsx": "^4.22.3",
  "typescript": "^6.0.3"
}
```
* ข้อพึงระวังใน tsconfig.json: ปล่อยให้ระบบดึงค่าอัตโนมัติ ไม่ควรไปล็อกค่าในแถว "types": ["node"] เพราะจะไปบดบังพจนานุกรมของคลังเครื่องมืออื่น (เช่น Prisma) จนทำให้เกิดตัวแดงลามทั้งหน้าจอแทน  
* คำสั่งล้างความจำหน้าจอ: เปิด Command Palette (Cmd + Shift + P) ➡️ เรียกคำสั่ง TypeScript: Restart TS Server เพื่อสั่งให้ระบบล้างความจำและเคลียร์ตัวแดงหลอกทิ้งไป  
---
### 📐Technical Constraints: 3. Prisma ORM Version 7.x Architectural Standard 
ตั้งแต่เวอร์ชัน 7.x เป็นต้นไป Prisma ได้ปรับเปลี่ยนสถาปัตยกรรมระดับรากฐานเพื่อเพิ่มความปลอดภัยและความยืดหยุ่นในการจัดการฐานข้อมูลข้ามเครือข่าย

#### 3.1 กฎเหล็กข้อใหม่ (Error Code: P1012) และการใช้ไฟล์ .config.mts
    * อาการของปัญหา: ห้ามไม่ให้ระบุตัวแปรแวดล้อมเชื่อมต่อ url = env("DATABASE_URL") ลงในไฟล์ prisma/schema.prisma โดยตรงเด็ดขาด
    * และเมื่อสร้างไฟล์คอนฟิกแยกด้านนอกเป็น prisma.config.ts ตัวอ่านของ Prisma จะเกิดอาการตาค้างเพราะสับสนระบบทีม ES Modules 
    * โครงสร้างที่ถูกต้อง:
        1. เหลือไฟล์ prisma/schema.prisma ไว้เพียงการระบุค่ายูทิลิตี้หลักและโมดูลตารางข้อมูล
        2. ทำการเปลี่ยนนามสกุลไฟล์คอนฟิกด้านนอกให้กลายเป็น prisma.config.mts (ตัวอักษร m ย่อมาจาก Module เป็นการติดป้ายไฟบอกตัวระบบว่าไฟล์นี้คือ TypeScript สายพันธุ์โมดูลยุคใหม่เต็มตัว)  
        
#### 3.2 ปัญหา "ครูระเบียบกลัวความว่างเปล่า" (Type Safety Checking)
    * อาการของปัญหา: ตัวดักจับโค้ดของ VS Code ขึ้นเส้นหยักแดงเตือนใต้คำว่า datasource ในไฟล์คอนฟิก เพราะกลัวว่าค่าตัวแปร process.env.DATABASE_URL จากไฟล์ .env อาจจะว่างเปล่า (undefined) ซึ่งระบบของ Prisma จะไม่ยอมรับค่าว่างนี้  
    * แนวทางแก้ไขตามกติกาหล่อเท่ (ดีกว่าการพิมพ์ปิดตาอย่าง // @ts-ignore):
    ทำการเติมเงื่อนไขสำรองป้องกันความเสี่ยง (Fallback Value) ดักไว้ท้ายประโยคด้วยการเขียนสัญลักษณ์ || "" (หมายถึง: ถ้าในอนาคตหาตัวแปรใน .env ไม่เจอจริง ๆ ก็ให้ยอมปล่อยวางส่งเป็นข้อความว่างเปล่าแทนซะนะ)
* prisma.config.mts พิมพ์เขียวไฟล์ ที่ถูกต้องสมบูรณ์แบบ:
```TS
import "dotenv/config";
  import { defineConfig } from '@prisma/config';

  export default defineConfig({
    datasource: {
      url: process.env["DATABASE_URL"] || ""
    },
  });
```
* schema.prisma ด้านหัว ก่อน model table จะเหลือเพียง
``` prisma
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client-js"
}
```
#### 3.3 Environment Variable Constraint & Fallback Value Requirement

ในการดึงค่าโครงสร้างระบบหรือพิกัดเชื่อมต่อจากไฟล์อินทรี `.env` ผ่านคำสั่ง `process.env` ในระบบ TypeScript ยุคใหม่ จะมีข้อบังคับด้านความปลอดภัยอย่างเข้มงวด (Strict Type Checking)

* **ปัญหาที่พบ (หยักแดงที่ตัวแปรรับค่าพอร์ตหรือ URL):** ตัวแปรที่รับค่าไปทำงานต่อพ่นข้อความเอเรอร์เตือนเกี่ยวกับประเภทข้อมูล หรือระบบปฏิเสธการทำงานหากไม่ระบุทางหนีไฟสำรอง
* **สาเหตุเชิงโครงสร้าง:** ค่าที่อ่านมาจาก `process.env.VARIABLE` มีสิทธิ์เป็นไปได้ 2 หน้าหน้าเสมอในมุมมองของ TypeScript คือ เป็น `string` (ถ้าอ่านเจอค่าจริง) หรือเป็น `undefined` (ถ้าลืมเขียนไว้ใน .env หรือระบบโหลดไม่ทัน) การส่งค่าที่มีโอกาสเป็น `undefined` ไปให้ฟังก์ชันระดับลึกทำงานต่อ (เช่น `app.listen()` หรือการตั้งค่า Config ของ Prisma 7) จะถูกระบบกักดักและพ่นตัวแดงประท้วงทันที
* **กฎกติกาการใช้ Fallback Value (ค่าสำรองลัดวงจร):**
  ทุกครั้งที่ดึงค่าจาก `process.env` ป๋าจำเป็นต้องใช้เครื่องหมาย `||` (OR Short-Circuit) พ่วงท้ายเพื่อระบุ "ค่าสำรอง" เสมอ แม้จะเป็นค่าว่างเปล่า `""` ก็ตาม เพื่อเป็นการการันตีให้ TypeScript มั่นใจ 100% ว่าแอปพลิเคชันจะได้รับข้อมูลประเภท `string` ไปทำงานแน่นอน ไม่เกิดค่าว่างเปล่ากลางอากาศ
  * *ตัวอย่างการเขียนที่ปลอดภัย:* `const PORT = process.env.PORT || "8500";` หรือ `const URL = process.env.DATABASE_URL || "";`
  * *จุดที่พบบังคับใช้บ่อย:* การกำหนด Port เซิร์ฟเวอร์, การระบุ String การเชื่อมต่อฐานข้อมูล (Database Connection String), และ Key ลับประจำระบบต่างๆ


---
### 🚀 Technical Constraints: 4. Modern Programming Options with Express 5

โปรเจกต์นี้เลือกใช้โครงสร้าง **Express เวอร์ชัน 5 (`^5.2.1`)** ซึ่งมีความสามารถในระดับโมเดิร์นเพิ่มขึ้นจากยุคก่อนหน้าอย่างเด่นชัด วิศวกรผู้พัฒนาสามารถเลือกสไตล์การเขียนโค้ดคุมช่องทาง API (Route Handler) ได้ 2 รูปแบบตามกลยุทธ์ที่เหมาะสม:

#### Option A: คลาสสิกปลอดภัย (Classic Try-Catch Block)
ยึดโครงสร้างสไตล์ดั้งเดิม มีการล้อมรั้วป้องกันข้อผิดพลาดในแต่ละจุดอย่างชัดเจน
```typescript
app.get('/api/golf-courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```
* ข้อดี: ควบคุมโครงสร้างข้อมูลหน้าตาข้อความข้อผิดพลาด (Error Response) ส่งกลับไปหาผู้ใช้งานหน้าบ้าน (React) ได้อย่างประณีตและสวยงามตามใจชอบ

#### Option B: คลีนสไตล์โมเดิร์น (Modern Express 5 Auto-Catch)
ใช้ประโยชน์จากสถาปัตยกรรมใหม่ของ Express 5 ที่ทำการดักจับ Error ของฟังก์ชันประเภท async/await ให้โดยอัตโนมัติ ทำให้ไม่จำเป็นต้องเขียนบล็อกครอบให้ยาวเหยียด
```ts
app.get('/api/golf-courses', async (req, res) => {
  const courses = await prisma.course.findMany(); 
  // 👈 หากท่อ Tunnel หลุดหรือ DB ล่ม Express 5 จะโยนข้อผิดพลาดไปที่ระบบจัดการส่วนกลางเอง เซิร์ฟเวอร์ไม่ดับกลางอากาศ (Crash)
  res.json({ success: true, data: courses });
});
```
* ข้อดี: โค้ดกระชับ สั้น อ่านง่าย ลดความซ้ำซ้อนในการเขียนคำสั่ง try/catch ในทุกๆ เส้นทาง
---
### 🌐 Technical Constraints: 5. Remote Connectivity & Network Tunneling (Digital Nomad Style)
กรณีที่เดินทางออกไปทำงานข้างนอก (สเตชั่นฝั่ง Mac - pp2) แล้วต้องการเชื่อมต่อระบบฐานข้อมูลกลับมาที่ถังเก็บข้อมูลวินโดวส์ server (pp1) ที่บ้านอย่างปลอดภัย มีขั้นตอนการจัดการระบบเครือข่ายเสมือนดังนี้:

#### 5.1 การเชื่อมต่อ Remote Desktop (Windows App) via Tailscale
* ขั้นตอนการคอนฟิก:
    1. เปิดแอป Tailscale บนทั้งเครื่อง Mac (pp2) และ Windows (pp1) ให้ขึ้นไฟเขียว Connected ร่วมกัน  
    2. เปิดแอป Windows App บน Mac ➡️ กดปุ่ม Add PC  
    3. ในช่อง PC Name ➡️ ใส่เลขทะเบียนทางด่วนลับที่ได้จาก Tailscale ของเครื่องบ้าน: 100.83.39.48  
    4. ในช่อง Credentials ➡️ ตั้งเป็น "Ask when required" เพื่อระบุ Username: Papoo และรหัสผ่านตอนเชื่อมต่อครั้งแรก  
    5. ในช่อง Friendly name ➡️ กำหนดชื่อแยกแยะว่า pp1-via-ts แล้วกดบันทึกใช้งานได้ทันทีจากทุกที่ในโลก

#### 5.2 การย่นขั้นตอนเซฟพลังงานด้วย "ปุ่มลัดอุโมงค์ข้อมูล" (Terminal Alias)
* เนื่องจากท่อเน็ตเวิร์กและอุโมงค์ SSH ทั้งหมดจะถูกปิดสวิตช์ตัดสายชั่วคราวโดยอัตโนมัติหากเครื่อง Mac เข้าสู่โหมดหลับ (Deep Sleep)[cite: 7] เพื่อไม่ให้วิศวกรอาวุโสต้องคอยพิมพ์คำสั่งยาวเหยียดทุกครั้ง จึงย่นขั้นตอนด้วยการสร้าง Alias ไว้ในสมุดบันทึกระบบ .zshrc (พิกัด Home Folder: ~/.zshrc) ดังนี้:
* คาถาลงอักขระปุ่มลัดครั้งแรก (พิมพ์ลง Terminal เครื่อง Mac):
```bash
echo "alias tunnel='ssh -L 3307:localhost:3306 -N Papoo@100.83.39.48'" >> ~/.zshrc && source ~/.zshrc
```
* วิธีเปิดใช้งานหลังจากนี้:
ทุกครั้งที่เปิดเครื่องคอมพิวเตอร์ขึ้นมาใหม่นอกสถานที่ หรือเปิด Terminal บานใหม่ใน VS Code ให้พิมพ์คำสั้น ๆ คำเดียวว่า:
```bash
tunnel
```
* พอกด Enter และกรอกรหัสผ่านของเครื่องบ้านปุ๊บ ท่อส่งข้อมูลข้ามมิติพอร์ต 3307 (ฝั่ง Mac) จะทะลวงสลับสัญญาณตรงไปเชื่อมพอร์ต 3306 (ก้นถัง MySQL บน Windows) ทันทีอย่างมั่นคงและปลอดภัย!
---
## 🏁 2. ลำดับคำสั่งติดตั้ง (Execution Order) เพื่อสร้าง Server และแก้ไขปัญหาตามคู่มือ TD-Tech.md
ให้ป๋าลุยพิมพ์คำสั่งตามลำดับจาก 1 ➡️ 5 บน Terminal ของ Mac (pp2) ดังนี้ครับ:

1. สเต็ปตั้งไข่: เริ่มต้นโครงสร้างโปรเจกต์ Node.js
คำสั่งเปิดโปรเจกต์เพื่อเนรมิตไฟล์ package.json เปล่าขึ้นมาในโฟลเดอร์:
```bash
npm init -y
```
* สิ่งที่ต้องทำต่อทันที: เปิดไฟล์ package.json แล้วคีย์ตัวแปรเพิ่มเข้าไป 1 บรรทัดคือ "type": "module" เพื่อประกาศสิทธิ์การใช้ระบบ ES Modules ยุคใหม่ (แก้ปัญหาหัวข้อที่ 1 ใน TD-Tech.md)
2. สเต็ปเตรียมกำลังพลหลังบ้าน (Production Dependencies)

* คำสั่งติดตั้งชุดเครื่องมือหลักที่แอปพลิเคชันต้องใช้ทำงานจริง (ตัวแปรจะวิ่งไปอยู่ในช่อง "dependencies"):
```bash
npm install express dotenv @prisma/client prisma
```
รายละเอียดแพ็คเกจ:

* express และ dotenv: เป็นด่านหน้าคอยเปิดพอร์ต 8500 และอ่านค่าไฟล์ .env

* @prisma/client และ prisma: เครื่องมือ ORM เวอร์ชัน 7.x สำหรับสลักข้อมูลลงตารางกอล์ฟ
สเต็ปติดสปีดตัวแปลภาษาและสคริปต์รันงาน (Development Dependencies)

3. คำสั่งส่งพนักงานเฉพาะกิจสายลุยลงสนาม (ตัวแปรวิ่งเข้าช่อง "devDependencies" เพื่อใช้เฉพาะตอนกำลังพัฒนาโค้ด):
```bash
npm install -D nodemon tsx
```
* รายละเอียดแพ็คเกจ:

    * tsx: หัวเทียนสตาร์ทเครื่องและเป็นวุ้นแปลภาษาให้อ่านไฟล์ .ts คาจอได้ทันที (แก้ปัญหาหัวข้อ 2.1 ใน TD-Tech.md)

    * nodemon: คนเฝ้าบ้านคอยรีสตาร์ทแอปให้เวลาป๋ากดเซฟโค้ด (แก้ปัญหาหัวข้อ 2.2 ใน TD-Tech.md)

* สิ่งที่ต้องทำต่อ: ยัดสคริปต์ความรู้ "dev": "nodemon --exec node --import tsx src/server.ts" ลงในช่อง "scripts"

4. สเต็ปส่ง "พจนานุกรม" ปราบตัวแดงของครูระเบียบ TypeScript
คำสั่งดาวน์โหลดคัมภีร์แปลประเภทข้อมูล (Type Definitions) ให้สมองกล VS Code รู้จักคำศัพท์ของฝั่ง Node.js และ Express:
```bash
npm install -D typescript @types/node @types/express
```
* คำตอบปมคาใจของป๋า: แพ็คเกจ @types/express ที่ป๋าสงสัย ก็คือผลลัพธ์ที่งอกมาจากคำสั่งบรรทัดนี้แหละครับป๋า! ติดตั้งเพื่อให้ตัวแปรพวก req (Request) และ res (Response) ในไฟล์ server.ts ไร้เส้นหยักแดงประท้วงกวนสายตาครับ (แก้ปัญหาหัวข้อ 2.3 ใน TD-Tech.md)

5. สเต็ปปล่อยพลังพิมพ์เขียวข้อบังคับ TypeScript
คำสั่งสุดท้ายสำหรับการสั่งรันระบบเพื่อสร้างไฟล์โครงสร้างการควบคุมภาษาประจำโปรเจกต์ (tsconfig.json):
```bash
npx tsc --init
```
### 📊 สรุปตารางความสัมพันธ์ (คำสั่ง ➡️ ผลลัพธ์ใน package.json)
เพื่อให้ป๋าตรวจเช็คความถูกต้องหลังจิ้มคำสั่ง เจ็มคุงสรุปเป็นตารางพิกัดเป้าหมายให้ส่องดูง่าย ๆ ดังนี้ครับ:

| ลำดับรัน | ชุดคำสั่งที่ป๋าต้องป้อนบน Terminal | หมวดหมู่ในpackage.json | แพ็คเกจที่เกิดขึ้นจริงบนจอ | ตัวช่วยแก้วิกฤตในคัมภีร์ |
| :-- | :-- | :-- | :-- | :-- |
| 1 | npm init -y | (สร้างไฟล์หลัก) | "type": "module" | ข้อ 1 ปรับระบบเข้าสู่มาตรฐานยุคใหม่ |
| 2 | npm install express dotenv @prisma/client prisma | "dependencies" | express, dotenv, @prisma/client, prisma | ข้อ 3 เตรียมกำลังรบและเอนจิ้น Prisma 7 |
| 3 | npm install -D nodemon tsx | "devDependencies" | "nodemon", "tsx"| ข้อ 2.1 & 2.2 ติดตั้งวุ้นแปลภาษาและตัวรันสคริปต์อัตโนมัติ |
| 4 | npm install -D typescript @types/node @types/express | "devDependencies" |"typescript", "@types/node", "@types/express" | ข้อ 2.3 นำเข้าพจนานุกรมปราบตัวแดงหลอกตา |
| 5 | npx tsc --init | (งอกไฟล์คอนฟิก) | สรรสร้างไฟล์ tsconfig.json ปิดเล่ม | คุมระเบียบประเภทข้อมูลรอบตัวแอปพลิเคชัน |
---
## 3. 🛠️ เทคนิคการเชื่อมต่อฐานข้อมูลผ่านระบบมุดอุโมงค์ (Prisma 7 + SSH Tunnel)
### 1. ข้อจำกัดของ Prisma 7 (Breaking Change)
* ห้ามใส่สาย String `url` หรือคำสั่ง `engineType` ลงในไฟล์ `prisma/schema.prisma` เด็ดขาด เพราะเอนจิ้นรุ่นใหม่ถอดระบบ Native Binary ออกเพื่อลดขนาดแอป
* ระบบบังคับให้บริหารจัดการพิกัดผ่านไฟล์ `prisma.config.mts` หรือหันมาพึ่งพาระบบ **Driver Adapter** เท่านั้น

### 2. วิธีการเชื่อมต่อฐานข้อมูลข้ามฝั่ง (MySQL via Driver Adapter)
* ติดตั้งแพ็กเกจไดรเวอร์ที่ถูกต้องตรงตามพิมพ์เขียวรันไทม์: `npm install @prisma/adapter-mariadb mariadb` (รองรับทั้ง MySQL และ MariaDB)
* ในไฟล์ `src/prisma.ts` ห้ามสร้าง `mariadb.createPool` เองตรง ๆ เพราะ TypeScript จะประท้วงเรื่องชนิดข้อมูล (Type Mismatch)
* วิธีการที่ดีที่สุด (Best Practice) คือการส่งก้อนพิมพ์เขียวคอนฟิก (Host, Port, User, Password) เข้าไปป้อนให้คลาส `new PrismaMariaDb()` เป็นผู้สร้างสระเก็บสัญญาณ (Pool) ภายในตัวเองโดยตรง

### 3. กฎเหล็กการรันคำสั่งเมื่อมีการแก้ไขโมเดล
ทุกครั้งที่มีการขยับ ปรับเปลี่ยน หรือล้างแคชระบบ ต้องรันกระบวนท่าคู่นี้เสมอ:
1. `npx prisma generate` (เพื่อขึ้นรูปสมองกลแกนหลักหลังบ้าน)
2. `npm run dev` (เพื่อฉีดไฟ .env เข้าเซิร์ฟเวอร์หลักพอร์ต 8500)