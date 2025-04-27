const express = require('express');
const router = express.Router();
const IssueCategoryController = require('../controllers/issueCategoryController');
const authMiddleware = require('../middlewares/authMiddleware'); 

/**
 * @swagger
 * /api/issue-category/create:
 *   post:
 *     tags:
 *       - Issue Categories
 *     summary: สร้างประเภทปัญหาใหม่
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถสร้างประเภทปัญหาใหม่ได้
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "ความสะอาด"
 *               roomTypeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: สร้างประเภทปัญหาสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 */
router.post('/create', authMiddleware, IssueCategoryController.createIssueCategory);

/**
 * @swagger
 * /api/issue-category/delete/{id}:
 *   delete:
 *     tags:
 *       - Issue Categories
 *     summary: ลบประเภทปัญหา
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถลบประเภทปัญหาได้
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของประเภทปัญหาที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       400:
 *         description: รหัสไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 *       404:
 *         description: ไม่พบประเภทปัญหา
 */
router.delete('/delete/:id', authMiddleware, IssueCategoryController.deleteIssueCategory);

/**
 * @swagger
 * /api/issue-category/all:
 *   get:
 *     tags:
 *       - Issue Categories
 *     summary: ดึงประเภทปัญหาทั้งหมด
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถดูประเภทปัญหาทั้งหมดได้
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: รายการประเภทปัญหาทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   category_name:
 *                     type: string
 *                     example: "อุปกรณ์ภายในห้องน้ำชำรุด (เครื่องสุขภัณฑ์, กระเบื้อง, สายชำระ ฯลฯ)"
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 */
router.get('/all', authMiddleware, IssueCategoryController.getAllIssueCategories);

/**
 * @swagger
 * /api/issue-category/update/{id}:
 *   put:
 *     tags:
 *       - Issue Categories
 *     summary: อัปเดตประเภทปัญหา
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถอัปเดตประเภทปัญหาได้
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสประเภทปัญหาที่ต้องการอัปเดต
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "ความสะอาด"
 *               roomTypeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 4]
 *     responses:
 *       200:
 *         description: อัปเดตประเภทปัญหาสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 *       404:
 *         description: ไม่พบประเภทปัญหา
 */
router.put('/update/:id', authMiddleware, IssueCategoryController.updateIssueCategory);

/**
 * @swagger
 * /api/issue-category/room-types:
 *   get:
 *     tags:
 *       - Issue Categories
 *     summary: ดึงประเภทห้องทั้งหมด (สำหรับเลือกตอนเพิ่ม/แก้ไขประเภทปัญหา)
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถดึงรายการประเภทห้องได้
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: รายการประเภทห้องทั้งหมด
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
 *                     example: "ห้องน้ำ"
 *             example:
 *               - id: 1
 *                 name: "ห้องน้ำ"
 *               - id: 2
 *                 name: "ห้องบรรยาย/ห้องคอม/ห้องอาจารย์"
 *               - id: 3
 *                 name: "ลานจอดรถ"
 *               - id: 4
 *                 name: "ห้องปฏิบัติการ"
 */
router.get('/room-types', authMiddleware, IssueCategoryController.getAllRoomTypes);

/**
 * @swagger
 * /api/issue-category/{id}:
 *   get:
 *     tags:
 *       - Issue Categories
 *     summary: ดึงข้อมูลประเภทปัญหาแบบรายตัว
 *     description: เฉพาะผู้ใช้ที่มี role เป็น `superadmin` เท่านั้นที่สามารถดึงข้อมูลประเภทปัญหารายตัวได้
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสประเภทปัญหาที่ต้องการดูรายละเอียด
 *     responses:
 *       200:
 *         description: ข้อมูลประเภทปัญหาและประเภทห้องที่เชื่อมโยง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "3"
 *                 category_name:
 *                   type: string
 *                   example: "ความสะอาด"
 *                 roomTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "ห้องน้ำ"
 *             example:
 *               id: "3"
 *               category_name: "ความสะอาด"
 *               roomTypes:
 *                 - id: 1
 *                   name: "ห้องน้ำ"
 *                 - id: 2
 *                   name: "ห้องบรรยาย/ห้องคอม/ห้องอาจารย์"
 *                 - id: 4
 *                   name: "ห้องปฏิบัติการ"
 *       400:
 *         description: รหัสไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 *       404:
 *         description: ไม่พบประเภทปัญหา
 */
router.get('/:id', authMiddleware, IssueCategoryController.getIssueCategoryById);



module.exports = router;
