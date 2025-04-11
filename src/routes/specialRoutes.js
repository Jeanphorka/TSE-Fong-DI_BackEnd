const express = require("express");
const router = express.Router();
const SpecialController = require("../controllers/specialController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/special-action/{id}:
 *   put:
 *     tags:
 *       - Special Case
 *     summary: ดำเนินการอนุมัติหรือปิดเคสจากหน้ารีวิวต่ำ
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสของปัญหาที่ต้องจัดการ
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, close]
 *                 example: approve
 *                 description: |
 *                   - `approve` → อนุมัติแล้วเปิดสถานะเป็น Reopened และล้างรีวิว
 *                   - `close` → ปิดเคส (เปลี่ยนสถานะเป็น Closed)
 *     responses:
 *       200:
 *         description: ดำเนินการสำเร็จ
 *       400:
 *         description: action ไม่ถูกต้อง
 *       401:
 *         description: Token ไม่ถูกต้องหรือไม่ได้ล็อกอิน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในระบบ
 */
router.put("/:id", authMiddleware, SpecialController.specialAction);

module.exports = router;
