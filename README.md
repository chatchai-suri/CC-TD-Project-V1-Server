# Session 1: General Description
# ⛳ Tournament Director (TD)

ระบบเว็บแอปพลิเคชันจัดการแข่งขันและคำนวณคะแนนกอล์ฟ To-Par สมัครเล่น รองรับโลจิกการคำนวณแต้มต่อแบบพิเศษ (Modified-Peoria)

---

## 👤 1. Developer Profile
* **ผู้พัฒนา:** ป๋าปู (อายุ 59 ปี)
* **ภูมิหลัง:** ปริญญาตรีวิศวกรรมอิเล็กทรอนิกส์-สื่อสาร & ปริญญาโทบริหารธุรกิจ (MBA)
* **เป้าหมาย:** ฝึกฝนเป็น Full-Stack Programmer เพื่อต่อยอดระบบ Web App และการวิเคราะห์ข้อมูลฝั่ง Industrial IoT / Sensor Analytics ในอนาคต

## 🎯 2. Project Goal & Requirements
* **ระบบจัดการแข่งขัน:** รองรับทั้งโหมดแข่งขันเป็นทางการ (Stroke Play) และออกรอบทั่วไป (Friendly Round)
* **ระบบบันทึกคะแนนหน้างาน:** ออกแบบหน้าจอคีย์คะแนนรายหลุม (Grid Selection 1-18) ขนาดใหญ่พิเศษ เพื่อลดปัญหาการกดพลาดขณะอยู่กลางแดดจัด
* **โลจิกคำนวณแต้มต่อ:** คำนวณหาแต้มต่อเฉพาะวันแบบอัตโนมัติด้วยสูตร Modified-Peoria โดยสุ่มหลุมลับร่วมกับฐานข้อมูลอายุผู้เล่น

## 🖥️ 3. Development Architecture & Environment
ระบบทำงานร่วมกันแบบลูกครึ่งข้ามระบบปฏิบัติการและเครือข่ายระยะไกล (Digital Nomad Style):
* **Development Station (pp2):** เครื่อง MacBook Pro สำหรับเขียนโค้ดหลังบ้าน (Node.js + Express + TypeScript)
* **Database Server (pp1):** เครื่อง Windows 11 Pro ที่บ้าน รันระบบ MySQL ผ่านตู้ Docker Container ตลอด 24 ชั่วโมง
* **Secure Network:** เชื่อมต่อและมุดท่อข้อมูลข้ามจังหวัดอย่างปลอดภัยผ่านทางเครือข่ายเสมือน **Tailscale** ร่วมกับอุโมงค์ความปลอดภัย **SSH Tunneling**

## ⚙️ 4. Getting Started & How to Run
ทุกครั้งที่เปิดเครื่องทำงานนอกสถานที่ ให้เปิด Terminal ทำการปลุกระบบตามลำดับดังนี้:

1. **เปิดท่อเชื่อมต่อฐานข้อมูลกลับบ้าน:**
```bash
   tunnel
```
* (หมายเหตุ: เป็นปุ่มลัด Alias ส่วนตัวที่ฝังไว้ใน ~/.zshrc เพื่อรันคำสั่งสลับพอร์ตข้ามมิติ 3307 -> 3306)
2. สตาร์ทเซิร์ฟเวอร์หลังบ้าน (Express API):
``` bash
npm run dev
```
* (ระบบจะรันผ่านหัวเทียน tsx และสแตนด์บายรอรับคำสั่งอยู่ที่พอร์ตด่านหน้า http://localhost:8500)

## *️⃣ 5. Technical Constraints
1. Node.js & ES Module System Standard
2. TypeScript Configuration & Runtime Execution Control
3. Prisma ORM Version 7.x Architectural Standard
4. Modern Programming Options with Express 5
5. Remote Connectivity & Network Tunneling (Digital Nomad Style)
6. ลำดับคำสั่งติดตั้ง (Execution Order) เพื่อสร้าง Server และแก้ไขปัญหาตามคู่มือ TD-Tech.md

---
# Session 2 : How to Dev-Server
## Step 1 Create Dev Plateform
``` bash
npm init -y
```
* file package.json: change default "CommonJS" (require) to be "ESModule" (to able to use import/export, as modern dev)
``` JSON
"type": "module"
```
## Step 2 Install package, make essential folder and files, modify package.json
### 2.1 Install essential package
``` bash
npm install express dotenv @prisma/client prisma cors helmet argon2 jsonwebtoken zod
```
* prisma is ORM engin ver 7.x

### 2.2 install nodemon, translater, library, dictionary of ts at devDependencies and prepare auto run script
* tsx: to translate ts and ESmodule stlye to be js for node.js runtime (not need compile file)
```bash
npm install -D tsx nodemon typescript @types/node @types/express @types/cors
```
* at package.json: devDepensencies will find out
```json
"devDependencies": {
  "@types/cors": "^2.8.19",
  "@types/express": "^5.0.6",
  "@types/node": "^25.9.1",
  "nodemon": "^3.1.14",
  "tsx": "^4.22.3",
  "typescript": "^6.0.3"
}
```
* prepare "dev" to be auto run code scripts
``` JSON
  "scripts": {

    "dev": "nodemon --exec node --import tsx src/server.ts"
    "index": "nodemon --exec node --import tsx src/index.ts"
  },
  ```
* start uo package and generate tsconfig.json
```bash
npx tsc init
```
* file tsconfig.js will be generated for control ts environment
### 2.3 make essential folders and files
* src/config        keep config.file e.g. prisma.config.ts
* src/controllers   keep controller (data muniputions) files
* src/middleswares  keep middleware (data-validation, error-handling)
* src/routes        keep router (service paths) files
* src/services      keep common services (e.g. database-access) files
* src/utils         keep common utilities (e.g. error-code-generate) files

---
## Step 3 Create Database
* Constrain: Prisma ORM Version 7.x Architectural Standard
### 3.1 initailize db
```bash
npx prisma init
```
* will found folder prisma and file prisma/schema.prisma
### 3.2 create file prisma.config.mts (manually!!!)
* Prisma ORM ver 7.x do not allow state URL of db directly in file schema.prisma (must use file prisma.config.mts instead, mts means module-ts file)

```js
import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  // 🎯 คอนฟิกหลักสำหรับ Prisma 7 CLI และ Runtime อยู่ตรงนี้
  datasource: {
    url: process.env.DATABASE_URL || "8500", 
  },
});
```
### 3.3 apply ER model in prisma.schema

### 3.4 generate Prisma Client translator & dictionary
```bash
npx prisma generate
```

### 3.5 migrate db model to db server
```bash
npx prisma migrate dev
```

### 3.6 prepare file for prisma instance of this project
* create file: src/prisma.ts (manually !!!)
* Prisma Ver 7.x don't library of mysql (to reduce size) and need install package (รองรับทั้ง MySQL และ MariaDB)

```bash
npm install @prisma/adapter-mariadb mariadb 
```
* file src/prisma.ts
``` ts
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 🎯 ไม้ตายปิดฉากศึก: ป้อนก้อนพิมพ์เขียวตั้งค่ามุดท่อพอร์ต 3307 ให้ PrismaMariaDb ตรง ๆ เลยครับป๋า!
// วิธีนี้ตัดการใช้คำสั่ง mariadb.createPool() ดักหน้าออกไป เส้นแดงหยักจะหายวับไปทันที 100%
const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'golf_root_password',
  database: process.env.DB_NAME || 'tournament_director_db',
  connectionLimit: 5,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // 🎯 ส่งอินสแตนซ์ที่ถูกต้องตามข้อกำหนดระบบ ผ่านฉลุยแน่นอนครับป๋า!
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

* prisma will translate/generate TS/JS (from ER model) and keep in @prisma/client 

* prisma will generate logical and physical db into server (pp1)

---
## Step 4 Middleware set up and Start up server (config .env, make src/middlewares/error.middleware.ts and server.ts)
### 4.1 .env
``` env
DATABASE_URL="mysql://root:golf_root_password@127.0.0.1:3307/tournament_director_db"
```
* assign db url, user name, password and port of local host (remote monitor where physical server is pp1)

### 4.2 src/middlewares/error.middleware.ts
```js
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // 🎯 ทางสว่างสากลนิยมประจำรุ่น Zod v4: ไร้เส้นแดง ไร้รอยขีดฆ่ากลาง คลีนกริบ 100%
  if (err instanceof ZodError) {
    const zodErrors = err.issues.reduce((acc: any, curr: any) => ({
      ...acc,
      [curr.path.join('.')]: curr.message
    }), {});

    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: zodErrors
    });
    return;
  }

  // 🎯 ดักจับกรณีเอเรอร์ทั่วไปของเซิร์ฟเวอร์ Express 5
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
};

export default errorMiddleware;           
```

### 4.3 src/server.ts setup middleware, import error.middleware.ts and start server
* server.ts
```js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // เพิ่มการนำเข้า CORS เพื่อจัดการกับปัญหา Cross-Origin Resource Sharing
import helmet from 'helmet'; // เพิ่มการนำเข้า Helmet เพื่อเพิ่มความปลอดภัยให้กับแอปพลิเคชัน
import errorMiddleware from './middlewares/error.middleware.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่
import { prisma } from './prisma.js'; // นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 

// ปลุกพลังให้ Node.js อ่านค่าจากไฟล์ .env เข้าไปในระบบ
dotenv.config();

const app = express();
const PORT = process.env.PORT || ""; // ใช้พอร์ตจาก .env หรือดีฟอลต์เป็น 8500 แต่ลองแก้ดีฟอลต์เป็น "" 

app.use(express.json());
app.use(cors());
app.use(helmet());

// API routes would go here


// handling errors 404 not found
app.use((req, res) => {
  res.status(404)
  .json({message: `path not found ${req.method} ${req.originalUrl}`});
});

// Global error handling middleware
app.use(errorMiddleware);

// เปิดประตูบานแรกให้เซิร์ฟเวอร์ตื่นทำงาน
app.listen(PORT, () => {
  console.log(`🚀 ==================yes==========================`);
  console.log(`🎯 Server is Listening on Port ${PORT}`);
  console.log(`🔗 Test GET: http://localhost:${PORT}/api/golf-courses`);
  console.log(`🚀 ============================================`);
});
```
## Step 6 Make routing (without middleware and logic)
* check file TD-Service.md to confirm routhing: path, method, parameters and description
* make essential files upon to routing TD-Service.md
``` js
auth.routes.ts
admin.routes.ts
td.routes.ts
scorer.routes.ts
user.routes.ts
```
* make auth.routes.ts & admin.routes.ts (as samples) without middleware and logic
* /src/routes/auth.routes.ts
```js
import {Router} from 'express';

const authRouter = Router();

authRouter.post('/register', (req, res) => {});
authRouter.post('/login', (req, res) => {});
authRouter.post('/getCurrUser', (req, res) => {});

export default authRouter;
```
* /src/admin.routes.ts
```js
import {Router} from 'express';

const authRouter = Router();

authRouter.post('/register', (req, res) => {});
authRouter.post('/login', (req, res) => {});
authRouter.post('/getCurrUser', (req, res) => {});

export default authRouter;
```
* /src/main.routes.ts
```js
import  {Router} from 'express';
import authRouter from './auth.routes.js';
import adminRouter from './admin.routes.js';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/admin', adminRouter);

export default mainRouter;
```
## Step 7 src/server.ts import main.ts and use at APT routing
* add code into src/server.ts
```js
import mainRouter from './routers/main.routes.js';

// API routes would go here
app.use('/api', mainRouter); // นำเข้า mainRouter ที่รวมทุกเส้นทางย่อยไว้แล้ว
```