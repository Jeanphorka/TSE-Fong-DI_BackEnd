const express = require("express");
const router = express.Router();
const IssueReportController = require("../controllers/issueReportController");
const authMiddleware = require("../middlewares/authMiddleware"); 

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/issue-reports:
 *   post:
 *     summary: Report an issue
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token ใน Header
 *     description: |
 *       - **ใช้ API นี้เพื่อแจ้งปัญหา**
 *       - **ต้องส่ง `problem_id`, `description`, `location_id`**
 *       - **`transaction_id` จะถูกสร้างอัตโนมัติในรูปแบบ `IS-DDMMYYYY-XXXX`**
 *       - ✅ **ผู้ใช้ต้องล็อกอินก่อน และแนบ Token ใน Header**
 *       - ✅ **ตัวอย่าง Request Body**
 *         ```json
 *         {
 *           "problem_id": 2,
 *           "description": "ไฟดับตั้งแต่เช้า",
 *           "location_id": 1
 *         }
 *         ```
 *     tags:
 *       - Issue Reports
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "🔒 ต้องใส่ Token ในรูปแบบ `Bearer <your_token>`"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problem_id:
 *                 type: integer
 *                 example: 2
 *               description:
 *                 type: string
 *                 example: "ไฟดับตั้งแต่เช้า"
 *               location_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Issue reported successfully.
 *       401:
 *         description: Unauthorized (ต้องมี Token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "You must log in before reporting an issue."
 *                 solution:
 *                   type: string
 *                   example: "Please log in and include a valid Bearer token in the Authorization header."
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal Server Error
 */
router.post("/", authMiddleware, IssueReportController.createIssueReport); 

module.exports = router;
