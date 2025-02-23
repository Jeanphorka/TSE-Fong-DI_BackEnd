const express = require("express");
const router = express.Router();
const IssueReportController = require("../controllers/issueReportController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/issue-reports:
 *   get:
 *     summary: Get user-specific issue reports
 *     security:
 *       - BearerAuth: []  # ✅ ต้องแนบ Token
 *     description: |
 *       - **ใช้ API นี้เพื่อดึงข้อมูลปัญหาที่ผู้ใช้แจ้งเองเท่านั้น**
 *       - ✅ **ต้องล็อกอินและส่ง Token**
 *     tags:
 *       - Issue Reports
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "🔒 ต้องใส่ Token ในรูปแบบ `Bearer <your_token>`"
 *     responses:
 *       200:
 *         description: Return user's issue reports
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
 *                     example: "IS-23022025-0001"
 *                   reporter_id:
 *                     type: integer
 *                     example: 5
 *                   description:
 *                     type: string
 *                     example: "ไฟดับทั้งตึก"
 *                   problem_name:
 *                     type: string
 *                     example: "ไฟฟ้าดับ"
 *                   status:
 *                     type: string
 *                     example: "Pending"
 *                   location_id:
 *                     type: integer
 *                     example: 1
 *                   building:
 *                     type: string
 *                     example: "ตึกอำนวยการ"
 *                   floor:
 *                     type: string
 *                     example: "1"
 *                   room:
 *                     type: string
 *                     example: "ห้องน้ำชายฝั่งตะวันตก (JC)"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-23T12:34:56.789Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-23T12:34:56.789Z"
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
 *                   example: "You must log in before accessing issue reports."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get("/", authMiddleware, IssueReportController.getUserIssues);


/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Issue reported successfully"
 *                 report:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     transaction_id:
 *                       type: string
 *                       example: "IS-23022025-0123"
 *                     reporter_id:
 *                       type: integer
 *                       example: 5
 *                     problem_id:
 *                       type: integer
 *                       example: 2
 *                     description:
 *                       type: string
 *                       example: "ไฟดับตั้งแต่เช้า"
 *                     status:
 *                       type: string
 *                       example: "Pending"
 *                     location_id:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-23T12:34:56.789Z"
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
