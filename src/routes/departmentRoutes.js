const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/departmentController');
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/departments/create:
 *   post:
 *     tags:
 *       - Departments
 *     summary: สร้างหน่วยงานใหม่
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     description: เพิ่มหน่วยงานใหม่ พร้อมระบุพื้นที่และประเภทปัญหาที่รับผิดชอบ โดยให้ส่งข้อมูลarea และ issues เป็น id เท่านั่น |
 *      - ✅ **ต้องล็อกอินและส่ง Token**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - areaIds
 *               - issueTypeIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: ฝ่ายซ่อมบำรุง
 *                 description: ชื่อของหน่วยงาน
 *               areaIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *                 description: รหัสพื้นที่ที่หน่วยงานรับผิดชอบ
 *               issueTypeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 4]
 *                 description: รหัสประเภทปัญหาที่หน่วยงานรับผิดชอบ
 *     responses:
 *       201:
 *         description: สร้างหน่วยงานสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: เพิ่มหน่วยงานสำเร็จ
 *                 departmentId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือซ้ำ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ชื่อหน่วยงานนี้ถูกใช้แล้ว
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post('/create', authMiddleware ,DepartmentController.createDepartment);

/**
 * @swagger
 * /api/departments/update/{id}:
 *   put:
 *     tags:
 *       - Departments
 *     summary: อัปเดตข้อมูลหน่วยงาน
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     description: อัปเดตชื่อหน่วยงาน พร้อมพื้นที่และประเภทปัญหาที่รับผิดชอบใหม่ทั้งหมด ✅ **ต้องล็อกอินและส่ง Token**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสของหน่วยงานที่ต้องการอัปเดต
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - areaIds
 *               - issueTypeIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: ฝ่ายเทคนิค
 *                 description: ชื่อใหม่ของหน่วยงาน
 *               areaIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3]
 *                 description: รายการรหัสพื้นที่ใหม่ที่รับผิดชอบ
 *               issueTypeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 4]
 *                 description: รายการรหัสประเภทปัญหาใหม่ที่รับผิดชอบ
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: อัปเดตข้อมูลหน่วยงานสำเร็จ
 *       400:
 *         description: ข้อมูลซ้ำ หรือไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: มีพื้นที่และประเภทปัญหานี้ในหน่วยงานอื่นแล้ว
 *       500:
 *         description: ระบบผิดพลาด
 */
router.put('/update/:id', authMiddleware ,DepartmentController.updateDepartment);

/**
 * @swagger
 * /api/departments/delete/{id}:
 *   delete:
 *     tags:
 *       - Departments
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     summary: ลบหน่วยงาน 
 *     description: ลบข้อมูลหน่วยงาน ✅ **ต้องล็อกอินและส่ง Token**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสของหน่วยงานที่ต้องการลบ
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ลบหน่วยงานเรียบร้อยแล้ว
 *       400:
 *         description: รหัสไม่ถูกต้อง
 *       500:
 *         description: ลบไม่สำเร็จ
 */
router.delete('/delete/:id',authMiddleware ,DepartmentController.deleteDepartment);

/**
 * @swagger
 * /api/departments/options:
 *   get:
 *     tags:
 *       - Departments
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     summary: ดึงรายการพื้นที่และประเภทปัญหาสำหรับ Multi-select
 *     description: ใช้สำหรับโหลด options เพื่อสร้างหรือแก้ไขหน่วยงาน - ✅ **ต้องล็อกอินและส่ง Token**
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 areas:
 *                   type: array
 *                   example:
 *                     - id: 1
 *                       name: ตึกอำนวยการ
 *                     - id: 2
 *                       name: ตึกวิจัย
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: ตึกอำนวยการ
 *                 issueTypes:
 *                   type: array
 *                   example:
 *                     - id: 1
 *                       name: ไฟฟ้า
 *                     - id: 2
 *                       name: ประปา
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: ไฟฟ้า
 */
router.get('/options', authMiddleware ,DepartmentController.getDepartmentOptions);

/**
 * @swagger
 * /api/departments/all:
 *   get:
 *     tags:
 *       - Departments
 *     summary: ดึงรายการหน่วยงานทั้งหมด
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     description: พร้อมพื้นที่และประเภทปัญหาที่รับผิดชอบ - ✅ **ต้องล็อกอินและส่ง Token**
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: ฝ่ายซ่อมบำรุง
 *                   areas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                   issueTypes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 */
router.get('/all', authMiddleware , DepartmentController.getAllDepartments);

module.exports = router;
