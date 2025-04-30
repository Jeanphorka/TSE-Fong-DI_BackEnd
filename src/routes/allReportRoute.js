const express = require("express");
const router = express.Router();
const { getAllReportsController } = require("../controllers/allReportController");
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/all-issue:
 *   get:
 *     summary: ดึงข้อมูลรายงานทั้งหมด
 *     description: API สำหรับดึงข้อมูลรายงานทั้งหมด พร้อมรายละเอียด เช่น สถานะ, รูปภาพ, สถานที่, ประเภทของปัญหา ฯลฯ
 *     tags: 
 *       - AllReports
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       transaction_id:
 *                         type: string
 *                         example: "IS-02032025-0001"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-02T06:40:29.293Z"
 *                       endat:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-03-02T06:43:04.476Z"
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "https://fongdi.s3.ap-southeast-2.amazonaws.com/uploads/1740897628148-481866778.jpeg"
 *                       location:
 *                         type: string
 *                         example: " "
 *                       category_name:
 *                         type: string
 *                         example: "ปัญหาเกี่ยวกับต้นไม้"
 *                       description:
 *                         type: string  
 *                         example: "ต้นไม้ล้มขวางทางโดนรถผม ขยับรถไม่ได้ครับ"
 *                       status:
 *                         type: string
 *                         example: "รอพิจารณา"
 *                       department_id:
 *                         type: integer
 *                         example: 3
 *                       department_name:
 *                         type: string
 *                         example: "งานบริการอาคารและสถานที่ฯ"
 *                       review:
 *                         type: string
 *                         example: "2.5"
 *                       comment:
 *                         type: string
 *                         example: "test"
 *                       closed:
 *                         type: boolean
 *                         example: false
 *                       deleted:
 *                         type: boolean
 *                         example: false
 *                       deleteat:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-03-02T06:43:04.476Z"
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */


router.get("/", authMiddleware, getAllReportsController);

module.exports = router;
