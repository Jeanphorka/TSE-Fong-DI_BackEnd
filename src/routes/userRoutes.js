const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     tags:
 *       - Users
 *     summary: ดึงข้อมูลผู้ใช้ทั้งหมด
 *     description: แสดงเฉพาะผู้ใช้ที่มี role เป็น admin หรือ agent เท่านั้น
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: รายชื่อผู้ใช้ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   password:
 *                     type: string
 *                     example: Tse0001
 *                   username:
 *                     type: string
 *                   full_name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   department_id:
 *                     type: integer
 *                   department_name:
 *                     type: string
 */
router.get('/all', authMiddleware, UserController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: ดึงข้อมูลผู้ใช้ตาม ID
 *     description: ใช้สำหรับดึงข้อมูลผู้ใช้แต่ละcolumnเพื่อนำไปแสดงในแบบฟอร์มแก้ไข โดยต้องเอาข้อมูลของเดิมมาใส่ใน fill ก่อน หากแก้ไขก็แก้ไขได้ แต่ตอนส่งต้องส่งข้อมูลครบทุกตัวเพื่ออัปเดตอีกครั้ง
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 department_id:
 *                   type: integer
 *                 department_name:
 *                   type: string
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.get('/:id', authMiddleware, UserController.getUserById);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     tags:
 *       - Users
 *     summary: สร้างผู้ใช้ใหม่
 *     description: เพิ่มผู้ใช้ใหม่ และสร้างรหัสผ่านอัตโนมัติในรูปแบบ Tse0001 เป็นต้น
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, fullName, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: jane.smith@dome.tu.ac.th
 *               fullName:
 *                 type: string
 *                 example: เจน สมิธ
 *               role:
 *                 type: string
 *                 example: agent
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: สร้างผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: สร้างผู้ใช้สำเร็จ
 *                 userId:
 *                   type: integer
 *                   example: 5
 *                 password:
 *                   type: string
 *                   example: Tse0005
 */
router.post('/create', authMiddleware, UserController.createUser);

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: อัปเดตข้อมูลผู้ใช้
 *     description: ใช้ร่วมกับ API `/users/{id}` เพื่อโหลดข้อมูลมาแสดงก่อน แล้วค่อยส่งกลับเพื่ออัปเดต
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, fullName, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: jane.smith@dome.tu.ac.th
 *               fullName:
 *                 type: string
 *                 example: เจน สมิธ
 *               role:
 *                 type: string
 *                 example: agent
 *               departmentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: อัปเดตผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: อัปเดตผู้ใช้สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.put('/update/:id', authMiddleware, UserController.updateUser);
/**
 * @swagger
 * /api/users/delete/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: ลบผู้ใช้
 *     description: ลบผู้ใช้จากระบบ โดยจะลบจาก agents และ set null ให้กับตารางอื่นที่มี FK
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบผู้ใช้เรียบร้อยแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ลบผู้ใช้เรียบร้อยแล้ว
 *       400:
 *         description: รหัสผู้ใช้ไม่ถูกต้อง
 *       500:
 *         description: ไม่สามารถลบผู้ใช้ได้
 */
router.delete('/delete/:id', authMiddleware, UserController.deleteUser);



module.exports = router;
