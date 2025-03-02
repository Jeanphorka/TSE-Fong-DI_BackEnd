const express = require("express");
const router = express.Router();
const { getAllReportsController } = require("../controllers/allReportController");

/**
 * @swagger
 * /api/all-issue:
 *   get:
 *     summary: ดึงข้อมูลรายงานทั้งหมด
 *     description: API สำหรับดึงข้อมูลรายงานที่มีสถานะ "รอรับเรื่อง" รวมถึงรายละเอียดที่เกี่ยวข้อง เช่น วันที่แจ้ง, รูปภาพ, สถานที่, และประเภทของปัญหา
 *     tags: 
 *       - AllReports
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
 *                         type: integer
 *                         example: 1
 *                       transaction_id:
 *                         type: string
 *                         example: "IS-02032025-0001"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-02T13:40:29.293127+07:00"
 *                       end_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-03-02T13:43:04.476474+07:00"
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "https://yourdomain.com/uploads/image1.jpg"
 *                       location:
 *                         type: string
 *                         example: "Building A Floor 3 Room 305"
 *                       category_name:
 *                         type: string
 *                         example: "ต้นไม้ล้ม"
 *                       description:
 *                         type: string  
 *                         example: "ต้นไม้ล้มขวางทางโดนรถผม ขยับรถไม่ได้ครับ"              
 *                       status:
 *                         type: string
 *                         example: "เสร็จสิ้น"
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

router.get("/", getAllReportsController);

module.exports = router;
