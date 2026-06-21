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

  // 🎯 2. ดักจับเอเรอร์จากระบบคู่แฝด createError.ts หรือเอเรอร์ทั่วไปของเซิร์ฟเวอร์ Express 5
  // แก้ไข: เปลี่ยนจาก err.status เป็น err.statusCode ให้ตรงตามข้อตกลงจักรวาลพิมพ์เขียวแล้วครับป๋า!
  const statusCode = err.statusCode || 500; 
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    errors: err.errors || null
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
## Step 5 Make routing (without middleware and logic)
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
## Step 6 src/server.ts import main.ts and use at APT routing
* add code into src/server.ts
```js
import mainRouter from './routers/main.routes.js';

// API routes would go here
app.use('/api', mainRouter); // นำเข้า mainRouter ที่รวมทุกเส้นทางย่อยไว้แล้ว
```
## Step 7 Set up src/utils/createError.ts and Controller files & folders system setup with mock up logic
7.1 src/utils/createErrors.ts
```js
// 🎯 1. สลักพิมพ์เขียวบอกครูระเบียบว่า AppError ตัวนี้มีคีย์พิเศษแถมมาด้วยนะ
export interface AppError extends Error {
  statusCode?: number;
  success?: boolean;
  errors?: any;
}

// 🎯 2. ฟังก์ชันตัวกลางสำหรับเนรมิตก้อน Error ประจำโปรเจกต์ TD
export default function createError(statusCode: number, message: string, errors: any = null): AppError {
  // สร้างก้อน Error ดั้งเดิมขึ้นมาก่อน
  const error = new Error(message) as AppError;
  
  // ฉีดพ่นคีย์พิเศษเข้าไปทำงานร่วมกับ Global Error Middleware ได้อย่างสมบูรณ์
  error.statusCode = statusCode;
  error.success = false;
  error.errors = errors;

  return error;
}
```
7.2 src/controllers make up folder following roles as made as in folder routers
```text
src/controllers/auth
src/controllers/admin
src/controllers/scorer
src/controllers/td
src/controllers/user
```
7.3 create controller files following on TD-Service.md, bases on roles-action as mock up files as below:

* /src/controllers/auth/auth.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; //
import createError from '../../utils/createError.js'; // ดึงคัมภีร์ตัวกลางมาใช้งาน (.js เสมอตามระเบียบ)

export const registerUser = async (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body;

  // 🎯 ตรวจสอบสิทธิ์ด่านแรก: ถ้ารหัสไม่ตรงกัน สั่งโยนก้อน Error ด้วยบรรทัดเดียวสั้น ๆ ได้เลยครับป๋า
  if (password !== confirmPassword) {
    // โยนก้อนผิดพลาดรหัส 400 ออกไปให้ Express 5 จัดการส่งต่อไปที่ส่วนกลางเองอัตโนมัติ
    throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
  }

  const newPlayer = await prisma.user.create({
    data: {
      username,
      password,
      fullname: username,
      nickname: "นักกอล์ฟใหม่",
      global_role: "USER" //
    },
  });

  res.status(201).json({
    success: true,
    message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
    data: newPlayer,
  });
};

// 🎯 POST: api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดนักกอล์ฟ)
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1. ค้นหาชื่อยูสเซอร์ในถัง MySQL ผ่าน Prisma
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  // ⚠️ ถ้าไม่พบชื่อผู้ใช้งานในระบบ ให้โยน Error ตัวกลางที่ป๋าออกแบบไว้ทันที
  if (!user) {
    throw createError(404, "ไม่พบชื่อผู้ใช้งานนี้ในระบบคลับครับป๋า!");
  }

  // 2. ตรวจสอบรหัสผ่าน (ช่วงตั้งไข่เราเช็คสายอักขระตรง ๆ ก่อนครับ)
  if (user.password !== password) {
    throw createError(400, "รหัสผ่านไม่ถูกต้อง กรุณาเช็ควงสวิงอีกครั้งครับป๋า!");
  }

  // 3. ผ่านฉลุย ส่งข้อมูลความสำเร็จกลับไปให้หน้าบ้าน
  res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับกลับสู่สนามครับ ป๋าได้สิทธิ์ในฐานะ [${user.global_role}] ⛳`,
    data: {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      global_role: user.global_role
    }
  });
};
```

* /src/controllers/admin/user.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; //
import createError from '../../utils/createError.js'; // ดึงคัมภีร์ตัวกลางมาใช้งาน (.js เสมอตามระเบียบ)

export const addGolfer = async (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body;

  // 🎯 ตรวจสอบสิทธิ์ด่านแรก: ถ้ารหัสไม่ตรงกัน สั่งโยนก้อน Error ด้วยบรรทัดเดียวสั้น ๆ ได้เลยครับป๋า
  if (password !== confirmPassword) {
    // โยนก้อนผิดพลาดรหัส 400 ออกไปให้ Express 5 จัดการส่งต่อไปที่ส่วนกลางเองอัตโนมัติ
    throw createError(400, "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับป๋าปู!");
  }

  const newPlayer = await prisma.user.create({
    data: {
      username,
      password,
      fullname: username,
      nickname: "นักกอล์ฟใหม่",
      global_role: "USER" //
    },
  });

  res.status(201).json({
    success: true,
    message: `เพิ่มรายชื่อนักกอล์ฟ ${username} สำเร็จเรียบร้อยครับ! 👤`,
    data: newPlayer,
  });
};

// 🎯 POST: api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดนักกอล์ฟ)
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1. ค้นหาชื่อยูสเซอร์ในถัง MySQL ผ่าน Prisma
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  // ⚠️ ถ้าไม่พบชื่อผู้ใช้งานในระบบ ให้โยน Error ตัวกลางที่ป๋าออกแบบไว้ทันที
  if (!user) {
    throw createError(404, "ไม่พบชื่อผู้ใช้งานนี้ในระบบคลับครับป๋า!");
  }

  // 2. ตรวจสอบรหัสผ่าน (ช่วงตั้งไข่เราเช็คสายอักขระตรง ๆ ก่อนครับ)
  if (user.password !== password) {
    throw createError(400, "รหัสผ่านไม่ถูกต้อง กรุณาเช็ควงสวิงอีกครั้งครับป๋า!");
  }

  // 3. ผ่านฉลุย ส่งข้อมูลความสำเร็จกลับไปให้หน้าบ้าน
  res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับกลับสู่สนามครับ ป๋าได้รับการจัดสิทธิ์ให้เป็น [${user.global_role}] ⛳`,
    data: {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      global_role: user.global_role
    }
  });
};
```

* /src/controllers/admin/course.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // นามสกุล .js ตามข้อบังคับโมดูลสากล

// 🎯 POST: admin/course/register หรือ td/course/register
export const registerCourse = async (req: Request, res: Response) => {
  // แกะกล่องข้อมูลจาก Postman ตามพิมพ์เขียวใน TD-Service.md ของป๋า
  const { course_name, section_name, hole_number, par, distance_yards } = req.body;

  // สั่ง Prisma ทลายกำแพง SSH พอร์ต 3307 ไปสลักข้อมูลลง MySQL เครื่อง pp1
  // ⚠️ Note: เจ็มคุงใช้ฟีลด์หลักให้สอดคล้องกับ schema.prisma เบื้องต้น ป๋าสามารถสลับปรับเปลี่ยนตามฟีลด์จริงได้เลยครับ
  const newCourse = await prisma.course.create({
    data: {
      course_name: course_name,
      location: section_name || "ชลบุรี", // ใช้ค่าฟีลด์ที่มีในโมเดลเป็นจุดรับส่งชั่วคราว
    },
  });

  res.status(201).json({
    success: true,
    message: `สลักข้อมูลสนามกอล์ฟ ${course_name} ลงฐานข้อมูลผ่านอุโมงค์สำเร็จเรียบร้อยครับป๋า! ⛳`,
    data: newCourse,
  });
};
```

* /src/controllers/admin/tournament.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // นามสกุล .js ตามข้อบังคับโมดูล[cite: 7]
import createError from '../../utils/createError.js';

/**
 * 🎯 คัมภีร์ควบคุม: ระบบลงทะเบียนแมตช์การแข่งขัน (Tournament Register)
 * Lifecycle Standard: 1 -> 2 -> 3 -> 4 -> n+1
 */
export const registerTournament = async (req: Request, res: Response) => {
  
  // ============================================================
  // 1. REQUEST MANAGEMENT (จัดการแกะกล่องนำเข้าข้อมูลจากหน้าด่าน)
  // ============================================================
  const { tournament_name, tournament_mode, use_age_option, course_id, event_date } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING (ตรวจตราคุณสมบัติและดักจับข้อผิดพลาด)
  // ============================================================
  // ดักเช็คชื่อแมตช์ห้ามว่างเปล่า เพื่อไม่ให้เอนจิ้นชั้นในเกิดอาการระเบิด
  if (!tournament_name) {
    throw createError(400, "ไม่สามารถสร้างแมตช์ได้: กรุณาระบุชื่อทัวร์นาเมนต์ให้ถูกต้องครับป๋า!");
  }

  // ============================================================
  // 4. ACTION STEPS (ขั้นตอนปฏิบัติการสลักข้อมูลลงขุมทรัพย์)
  // ============================================================
  // สเต็ป 4.1: นำก้อนพัสดุพิกัดข้ามเครือข่ายพอร์ต 3307 ไปหยอดใส่ตาราง MySQL[cite: 8]
  const newMatch = await prisma.tournament.create({
    data: {
      tournament_name,
      tournament_mode: tournament_mode || "Stroke Play", // ค่าสำรองถ้าหน้าจอไม่ส่งมา[cite: 9]
      use_age_option: use_age_option || false,           // ค่าสำรองสิทธิ์การคำนวณอายุ[cite: 9]
      course_id: Number(course_id),                      // มั่นใจว่าเป็น Number ป้องกันไทป์เพี้ยน[cite: 7]
      event_date: new Date(event_date),                  // ฟอร์แมตสายอักขระวันที่เข้าสู่ระบบเวลาสากล[cite: 20]
      status: "setup"                                    // ติดป้ายสถานะเตรียมพร้อมจัดก๊วนทีออฟ[cite: 9]
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT (สรุปผลการเดินทางพ่นสัมฤทธิผลกลับหน้าบ้าน)
  // ============================================================
  res.status(201).json({
    success: true,
    message: `เนรมิตแมตช์แข่งขัน ${tournament_name} ลงระบบท่อฐานข้อมูลสำเร็จเรียบร้อยครับป๋า! 🏆`,
    data: newMatch
  });
};
```

7.4 update src/routers

* /src/routers/auth.routes.ts
```js
import {Router} from 'express';
import { registerUser } from '../controllers/auth/auth.controller.js'; // แก้ไขชื่อฟังก์ชันให้ตรงกับที่ export จริงใน auth.controller.ts
import { login } from '../controllers/auth/auth.controller.js';

const authRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/auth
authRouter.post('/register', registerUser);
authRouter.post('/login', login);
authRouter.post('/getCurrUser', (req, res) => {});

export default authRouter;
```

* /src/routers/admin.routes.ts
```js
import {Router} from 'express';
import {registerCourse} from '../controllers/admin/course.controller.js';
import {addGolfer} from '../controllers/admin/user.controller.js';
import {registerTournament} from '../controllers/admin/tournament.controller.js';

const adminRouter = Router();

// ENDPOINTS http://localhost:8500/api/v1/admin

adminRouter.post('/user/addGolfer', addGolfer);
adminRouter.put('/user/changeRole', (req, res) => {});
adminRouter.delete('/user/delete', (req, res) => {});

adminRouter.post('/course/register', registerCourse);

adminRouter.post('/tournament/register', registerTournament);
adminRouter.post('/tournament/editScore', (req, res) => {});
adminRouter.post('/tournament/close', (req, res) => {});

export default adminRouter;
```

## Step 8 update DB design standard, basic tech KB, and ER diagram R02
```text
see detail in
TD-Working-Rules.md
TD-Basic-Tech.md
ER diagram: ER for TD project R02.drawio
```

## Step 9 feat: implement core flight management APIs and score entry with real-time to-par calculation
1. controller and related router
```text
API post: /api/v1/auth/registerUser
API post: /api/v1/td/flight/setupFlightWithMembers
API put: /api/v1/td/flight/changeFlightName
API put: /api/v1/td/flight/changeFlightMembers
API post: /api/v1/scorer/tournament/recordScoreHole
```
2. src/controllers/auth/auth.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // 👈 นามสกุล .js ตามระเบียบ ES Module ยุคใหม่ 
import createError from '../../utils/createError.js'; // 👈 ตัวดักจับ Error ส่วนกลาง 

// 🎯 POST: api/v1/auth/registerUser (ลอจิกการลงทะเบียนผู้ใช้)
export const registerUser = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { username, password, fullname, nickname, phone_number, age } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!fullname) {
    throw createError(400, "ไม่สามารถลงทะเบียนได้: กรุณาระบุชื่อ-นามสกุลจริงด้วยครับป๋า!");
  }

  // ดักจับ Username ซ้ำล่วงหน้าระดับแอป (Strict Checking)
  if (username) {
    const existingUser = await prisma.user.findUnique({ where: { username } }); // [cite: 1, 2]
    if (existingUser) {
      throw createError(400, `Username "${username}" นี้มีคนใช้ในสนามแล้วครับป๋า!`);
    }
  }

  // ============================================================
  // 4. ACTION STEPS (สลักข้อมูลลงตู้ MySQL ผ่านท่อ 3307)
  // ============================================================
  const newUser = await prisma.user.create({ // [cite: 1]
    data: {
      username: username || null, // [cite: 1, 2]
      password: password || null, // 👈 เฟสแรกยังไม่แฮช รันแบบ Simply Standard เพื่อเช็ค Data Flow 
      fullname, // [cite: 1, 3]
      nickname: nickname || null, // [cite: 1, 3]
      phone_number: phone_number || null, // [cite: 1, 4]
      age: age ? Number(age) : null, // 👈 มั่นใจว่าเป็น Int ป้องกัน Type เพี้ยนตอนเข้าฐานข้อมูล [cite: 1, 4, 7]
      global_role: "GOLFER" // 👈 ค่าเริ่มต้นสากลนิยม [cite: 1, 5]
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(201).json({
    success: true,
    message: `สลักชื่อนักกอล์ฟ "${fullname}" เข้าสู่ระบบท่อฐานข้อมูลเรียบร้อยแล้วครับป๋า! 🏌️‍♂️`,
    data: {
      user_id: newUser.user_id, // [cite: 1]
      username: newUser.username, // [cite: 1, 2]
      fullname: newUser.fullname // [cite: 1, 3]
    }
  });
};

// 🎯 POST: api/v1/auth/login (ลอจิกดักเช็คพาสเวิร์ดนักกอล์ฟ)
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 1. ค้นหาชื่อยูสเซอร์ในถัง MySQL ผ่าน Prisma
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  // ⚠️ ถ้าไม่พบชื่อผู้ใช้งานในระบบ ให้โยน Error ตัวกลางที่ป๋าออกแบบไว้ทันที
  if (!user) {
    throw createError(404, "ไม่พบชื่อผู้ใช้งานนี้ในระบบคลับครับป๋า!");
  }

  // 2. ตรวจสอบรหัสผ่าน (ช่วงตั้งไข่เราเช็คสายอักขระตรง ๆ ก่อนครับ)
  if (user.password !== password) {
    throw createError(400, "รหัสผ่านไม่ถูกต้อง กรุณาเช็ควงสวิงอีกครั้งครับป๋า!");
  }

  // 3. ผ่านฉลุย ส่งข้อมูลความสำเร็จกลับไปให้หน้าบ้าน
  res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับกลับสู่สนามครับ ป๋าได้สิทธิ์ในฐานะ [${user.global_role}] ⛳`,
    data: {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      global_role: user.global_role
    }
  });
};
```
3. src/controllers/td/flight.controller.ts
```js
import type { Request, Response } from "express";
import { prisma } from "../../prisma.js"; //
import createError from "../../utils/createError.js"; //

// 🎯 POST: api/v1/td/flight/setupFlightWithMembers (ลอจิกการสร้างก๊วนพร้อมสมาชิก)
export const setupFlightWithMembers = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  // รับไอดีทัวร์นาเมนต์, ชื่อก๊วน, เวลาทีออฟ และอาร์เรย์ของไอดีนักกอล์ฟที่จะยัดลงก๊วนนี้ (สูงสุด 4-5 คน)
  const { tournament_id, flight_name, t_off_time, user_ids } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!tournament_id || !flight_name) {
    throw createError(
      400,
      "ข้อมูลไม่ครบถ้วน: กรุณาระบุระเบียบ tournament_id และ flight_name ด้วยครับป๋า!",
    );
  }

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw createError(
      400,
      "จัดก๊วนล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อนักกอล์ฟอย่างน้อย 1 คนครับ!",
    );
  }

  // ============================================================
  // 4. ACTION STEPS (ใช้ความสามารถของ Prisma 7 ทำ Transaction ป้องกันข้อมูลตกหล่น)
  // ============================================================
  const result = await prisma.$transaction(async (tx) => {
    // สเต็ป 4.1: สร้างตารางแม่ก๊วนทีออฟ (Flight) ก่อน
    const newFlight = await tx.flight.create({
      // [cite: 1, 10]
      data: {
        tournament_id: Number(tournament_id), // [cite: 1, 10]
        flight_name, // [cite: 1, 10]
        t_off_time: t_off_time || null, // [cite: 1, 11]
      },
    });

    // สเต็ป 4.2: แปลงร่าง user_ids ให้กลายเป็นก้อนพัสดุเตรียมหยอดลงตารางลูก (FlightMember)
    const memberData = user_ids.map((id: number) => ({
      flight_id: newFlight.flight_id, // 👈 ใช้ไอดีที่เพิ่งงอกมาจากสเต็ปบน [cite: 1, 11, 13]
      user_id: Number(id), // [cite: 1, 13]
      handicap_claim: 0, // ค่าเริ่มต้นรอเคลมแฮนดิแคปหน้างาน [cite: 1, 13]
    }));

    // สเต็ป 4.3: ยิงถล่มบันทึกสมาชิกลงก๊วนพร้อมกันในคำสั่งเดียว (Bulk Create)
    // ⚠️ Note: ข้อบังคับ @@unique([flight_id, user_id]) ในตู้ MySQL จะทำงานคุ้มครองทันที ดักนักกอล์ฟลงซ้ำก๊วน! [cite: 1, 13]
    await tx.flightMember.createMany({
      data: memberData,
    });

    // ดึงข้อมูลที่สลักเสร็จสรรพออกมารายงานตัว
    const fullFlightInfo = await tx.flight.findUnique({
      // [cite: 1, 10]
      where: { flight_id: newFlight.flight_id }, // [cite: 1, 11]
      include: {
        members: {
          // [cite: 1, 11]
          include: {
            user: {
              omit: { password: true }, // [cite: 1, 11] ดึงข้อมูลยูสเซอร์แต่ไม่เอาพาสเวิร์ดออกมาด้วย
            },
          },
        },
      },
    });

    return fullFlightInfo;
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(201).json({
    success: true,
    message: `เนรมิตกลุ่มก๊วน "${flight_name}" พร้อมบรรจุรายชื่อนักกอล์ฟ ${user_ids.length} ท่านลงระบบสำเร็จครับ! ⛳`,
    data: result,
  });
};

// 🎯 PUT: api/v1/td/flight/changeFlightName (ลอจิกการแก้ไขชื่อก๊วนหรือเวลาทีออฟ)
export const updateFlightInfo = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { flight_id, flight_name, t_off_time } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id) {
    throw createError(400, "ไม่สามารถแก้ไขได้: กรุณาระบุรหัสระเบียบ flight_id ด้วยครับป๋า!");
  }

  // ============================================================
  // 4. ACTION STEPS (สั่งค้อนเหล็ก Prisma สับเปลี่ยนข้อมูล)
  // ============================================================
  const updatedFlight = await prisma.flight.update({
    where: { flight_id: Number(flight_id) },
    data: {
      flight_name: flight_name || undefined, // 👈 ถ้าหน้าบ้านไม่ส่งมา ให้คงค่าเดิมไว้ ไม่เปลี่ยนเป็น null
      t_off_time: t_off_time !== undefined ? t_off_time : undefined
    }
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: `ปรับแต่งข้อมูลกลุ่มก๊วนดีเทลใหม่สำเร็จเรียบร้อยครับป๋า! ⛳`,
    data: updatedFlight
  });
};

// 🎯 PUT: api/v1/td/flight/changeFlightMembers (ลอจิกการล้างไพ่จัดสมาชิกก๊วนใหม่สดหน้างาน)
export const changeFlightMembers = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  const { flight_id, user_ids } = req.body; // รับไอดีก๊วน และ Array รายชื่อนักกอล์ฟชุดใหม่ล่าสุด

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id) {
    throw createError(400, "สลับสมาชิกล้มเหลว: กรุณาระบุ flight_id เป้าหมายด้วยครับป๋า!");
  }

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw createError(400, "สลับสมาชิกล้มเหลว: ก๊วนกอล์ฟจำเป็นต้องมีรายชื่อสมาชิกอย่างน้อย 1 คนครับ!");
  }

  // ============================================================
  // 4. ACTION STEPS (ใช้ระเบียบ All-or-Nothing เคลียร์เก่า-ยัดใหม่ ป้องกันข้อมูลชนกัน)
  // ============================================================
  const result = await prisma.$transaction(async (tx) => {
    
    // สเต็ป 4.1: สั่งล้างท่อ ลบรายชื่อนักกอล์ฟชุดเก่าทุกคนในก๊วนนี้ออกให้เกลี้ยงก่อน
    await tx.flightMember.deleteMany({
      where: { flight_id: Number(flight_id) }
    });

    // สเต็ป 4.2: ขึ้นรูปก้อนพัสดุอาร์เรย์สมาชิกชุดใหม่มารองรับ
    const newMembers = user_ids.map((id: number) => ({
      flight_id: Number(flight_id),
      user_id: Number(id),
      handicap_claim: 0 // ค่าเริ่มต้นรอรีเซ็ตหน้างาน
    }));

    // สเต็ป 4.3: ยิงคำสั่งพหูพจน์ Bulk Create บรรจุรายชื่อใหม่ลงตู้ MySQL
    await tx.flightMember.createMany({
      data: newMembers
    });

    // ดึงข้อมูลที่สับเปลี่ยนเสร็จสมบูรณ์พร้อมกรอง Password ตามกฎเหล็กความปลอดภัย
    const fullFlightInfo = await tx.flight.findUnique({
      where: { flight_id: Number(flight_id) },
      include: {
        members: {
          include: {
            user: {
              omit: { password: true } // 👈 คุ้มครองความปลอดภัยตาม Working Rule 4.3
            }
          }
        }
      }
    });

    return fullFlightInfo;
  });

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: "ล้างไพ่จัดสรรนักกอล์ฟลงก๊วนตัวจริงชุดใหม่เรียบร้อยครับป๋าปู! 🏌️‍♂️🔥",
    data: result
  });
};
```
4. src/controllers/scorer/tournament.controller.ts
```js
import type { Request, Response } from 'express';
import { prisma } from '../../prisma.js'; // 
import createError from '../../utils/createError.js'; // 

export const recordHoleScore = async (req: Request, res: Response) => {
  // ============================================================
  // 1. REQUEST MANAGEMENT
  // ============================================================
  // แกะกล่องคะแนนดิบรายหลุมตามระเบียบคลิกเลือกจากหน้าจอ Grid Selection ของป๋า
  const { flight_id, user_id, hole_id, strokes } = req.body;

  // ============================================================
  // 2. VALIDATION & 3. ERROR HANDLING
  // ============================================================
  if (!flight_id || !user_id || !hole_id || strokes === undefined) {
    throw createError(400, "ไม่สามารถบันทึกแต้มได้: กรุณาส่งพิกัดด่านคีย์คะแนนดิบมาให้ครบถ้วนครับป๋าปู!");
  }

  // ============================================================
  // 4. ACTION STEPS (สะพานสายตรง 3 ประสาน ดึง-คำนวณ-สลัก)
  // ============================================================
  
  // สเต็ป 4.1: ส่องหาแม่แบบข้อมูลหลุม (Hole) เพื่อดึงค่า "Par" ประจำหลุมนั้นมาเตรียมคำนวณย่นเลเยอร์
  const holeSpec = await prisma.hole.findUnique({ // [cite: 1, 9]
    where: { hole_id: Number(hole_id) } // [cite: 1, 9]
  });

  if (!holeSpec) {
    throw createError(404, "ตรวจพบข้อผิดพลาด: ไม่พบรหัสระเบียบหลุมกอล์ฟนี้ในพิมพ์เขียวสนามครับ!");
  }

  // สเต็ป 4.2: ปฏิบัติการ Upsert (ถ้ายังไม่เคยคีย์ให้ create / ถ้าคีย์ซ้ำให้ update ทับไปเลย)
  // ป้องกันอุบัติเหตุนิ้วเปียกสัมผัสพลาดหน้างานได้อย่างประณีตตามวินัย
  const savedScore = await prisma.score.upsert({ // [cite: 1, 14]
    // ค้นหาเป้าหมายเดิมจาก Composite Unique / หรือระบุสลักคะแนนประจำบุคคล
    // ⚠️ Note: เนื่องจากเราต้องการเช็คการแทงซ้ำของ [user_id + hole_id] ป๋าอาจทำ @@unique ไว้ที่ Score ในอนาคต
    // เบื้องต้นใช้ลอจิก ค้นหาคะแนนเก่าที่เคยบันทึกไว้ในแมตช์นี้ หลุมนี้ ของคนนี้ก่อนครับ
    where: {
      score_id: await prisma.score.findFirst({ // [cite: 1, 14]
        where: {
          flight_id: Number(flight_id), // [cite: 1, 14]
          user_id: Number(user_id), // [cite: 1, 14]
          hole_id: Number(hole_id) // [cite: 1, 14]
        }
      }).then(res => res?.score_id || -1) // ถ้าไม่เจอ ส่ง -1 ไปเพื่อให้มันวิ่งไปฝั่ง create [cite: 1, 14]
    },
    update: {
      strokes: Number(strokes), // อัปเดตทับแต้มเก่ากรณีคีย์ผิด [cite: 1, 14]
    },
    create: {
      flight_id: Number(flight_id), // [cite: 1, 14]
      user_id: Number(user_id), // [cite: 1, 14]
      hole_id: Number(hole_id), // [cite: 1, 14]
      strokes: Number(strokes) // [cite: 1, 14]
    }
  });

  // สเต็ป 4.3: คำนวณหาค่าความต่างคะแนน To-Par ณ หลุมนั้นสด ๆ กลางอากาศ
  // สูตรคณิตศาสตร์กอล์ฟสากลนิยม: คะแนนที่ทำได้ (Strokes) - คะแนนมาตรฐานประจำหลุม (Par)
  const currentStrokes = savedScore.strokes; // [cite: 1, 14]
  const holePar = holeSpec.par; // [cite: 1, 8]
  const toParResult = currentStrokes - holePar; 
  
  // แปลงตัวเลขเป็นข้อความให้จดจำและแสดงผลหน้า Leaderboard ง่ายๆ สไตล์กอล์ฟมืออาชีพ
  let toParDisplay = `${toParResult}`;
  if (toParResult === 0) toParDisplay = "E"; // Even Par (เสมอตัว)
  if (toParResult > 0) toParDisplay = `+${toParResult}`; // เกินพาร์ (เช่น +1, +2)

  // ============================================================
  // n+1. RESPONSE MANAGEMENT
  // ============================================================
  res.status(200).json({
    success: true,
    message: "สลักคะแนนดิบลงถังข้อมูลเรียบร้อยแล้วครับป๋า!",
    data: {
      score_id: savedScore.score_id, // [cite: 1, 14]
      strokes: currentStrokes,
      hole_par: holePar,
      to_par: toParResult,
      display: toParDisplay // 👈 ตัวอักษรด่านหน้า "E", "+1", "-2" ดึงไปขึ้นจอสมาร์ทโฟนได้ทันที!
    }
  });
};
```

