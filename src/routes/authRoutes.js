const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: เข้าสู่ระบบด้วยบัญชีของมหาวิทยาลัยธรรมศาสตร์
 *     description: |
 *       ใช้สำหรับให้นักศึกษาคณะวิศวกรรมศาสตร์เข้าสู่ระบบผ่านระบบยืนยันตัวตนของมหาวิทยาลัยธรรมศาสตร์ (TU API)  
 *       ✅ ต้องแนบ `Application-Key` ผ่าน Header เพื่อเรียกใช้งาน API  
 *       ✅ อนุญาตเฉพาะผู้ใช้ที่อยู่ใน "คณะวิศวกรรมศาสตร์" เท่านั้น  
 *       หากเข้าสู่ระบบสำเร็จ ระบบจะออก JWT token สำหรับใช้งานในระบบต่อไป
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserName
 *               - PassWord
 *             properties:
 *               UserName:
 *                 type: string
 *                 example: "6510742643"
 *                 description: รหัสนักศึกษา
 *               PassWord:
 *                 type: string
 *                 example: "12345678911"
 *                 description: รหัสผ่านบัญชีมหาวิทยาลัย
 *               uid:
 *                 type: string
 *                 example: "1234567890"
 *                 description: uid line 
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ พร้อมส่ง token กลับมา
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: เข้าสู่ระบบสำเร็จ
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     faculty:
 *                       type: string
 *                     department:
 *                       type: string
 *       400:
 *         description: ขาด username หรือ password
 *       401:
 *         description: รหัสผ่านไม่ถูกต้อง หรือไม่สามารถยืนยันตัวตนได้
 *       403:
 *         description: ไม่อนุญาตให้ผู้ใช้นอกคณะวิศวกรรมศาสตร์เข้าสู่ระบบ
 */
router.post('/login', authController.login);





module.exports = router;
