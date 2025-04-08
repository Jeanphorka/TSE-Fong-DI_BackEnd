const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/agentController');
const authMiddleware = require('../middlewares/authMiddleware'); 

/**
 * @swagger
 * /api/agent/issues:
 *   get:
 *     tags:
 *       - Agent
 *     summary: ดึงรายการเคสของหน่วยงานที่ Agent สังกัดอยู่
 *     description: ดึงเฉพาะรายการเคสที่ assigned_to เป็นหน่วยงานเดียวกับ agent และสถานะอยู่ที่ "รอรับเรื่อง"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงรายการเคสสำเร็จ
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
 *                   transaction_id:
 *                     type: string
 *                     example: IS-02032025-0001
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   endat:
 *                     type: string
 *                     format: date-time
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["https://s3.amazonaws.com/bucket/image1.jpg"]
 *                   location:
 *                     type: string
 *                     example: อาคาร A ชั้น 2 ห้อง 204
 *                   category_name:
 *                     type: string
 *                     example: ไฟฟ้า
 *                   description:
 *                     type: string
 *                     example: หลอดไฟเสีย
 *                   status:
 *                     type: string
 *                     example: รอรับเรื่อง
 *                   department_id:
 *                     type: integer
 *                     example: 3
 *                   department_name:
 *                     type: string
 *                     example: ฝ่ายซ่อมบำรุง
 *       401:
 *         description: Unauthorized - ไม่พบ token หรือ token ไม่ถูกต้อง
 *       404:
 *         description: ไม่พบหน่วยงานของ agent
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.get('/issues', authMiddleware, AgentController.getAssignedIssues);

module.exports = router;
