const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController")
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/review/{id}:
 *   put:
 *     tags:
 *       - Review
 *     summary: ส่งคะแนนรีวิวและคอมเมนต์สำหรับปัญหา
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสของปัญหา (issue) ที่จะรีวิว
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - review
 *             properties:
 *               review:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *                 description: คะแนนรีวิว (ระหว่าง 1 ถึง 5)
 *               comment:
 *                 type: string
 *                 example: แก้ไขเร็วมากครับ
 *                 description: ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
 *     responses:
 *       200:
 *         description: บันทึกรีวิวสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: บันทึกรีวิวสำเร็จ
 *                 review:
 *                   type: number
 *                   example: 4.5
 *                 comment:
 *                   type: string
 *                   example: แก้ไขเร็วมากครับ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้ส่ง Token หรือ Token ไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.put('/:id', authMiddleware, ReviewController.submitReview);


module.exports = router;
