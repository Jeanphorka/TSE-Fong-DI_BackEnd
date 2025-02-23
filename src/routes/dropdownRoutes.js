const express = require("express");
const router = express.Router();
const DropdownController = require("../controllers/dropdownController");

/**
 * @swagger
 * /api/dropdown/buildings:
 *   get:
 *     summary: Get all buildings
 *     description: |
 *       - **ใช้ API นี้เพื่อดึงรายการอาคารทั้งหมด**
 *       - **ไม่ต้องส่ง Parameter**
 *       - ✅ **ตัวอย่าง URL ที่ถูกต้อง:** `/api/dropdown/buildings`
 *     tags:
 *       - Dropdown
 *     responses:
 *       200:
 *         description: List of buildings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   building:
 *                     type: string
 *                     example: "ตึก A"
 */
router.get("/buildings", DropdownController.getBuildings);

/**
 * @swagger
 * /api/dropdown/floors:
 *   get:
 *     summary: Get floors for a selected building
 *     description: |
 *       - **ใช้ API นี้หลังจากเลือกอาคาร**
 *       - **ต้องส่ง `building` ใน Query Parameters**
 *       - ✅ **ตัวอย่าง URL ที่ถูกต้อง:** `/api/dropdown/floors?building=ตึก A`
 *       - ❌ **ถ้าไม่ส่ง `building` จะได้ Error 400**
 *     tags:
 *       - Dropdown
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           - **ชื่อของอาคารที่ต้องการดึงชั้น**
 *           - **ต้องเป็นค่าที่มีอยู่ในฐานข้อมูล**
 *     responses:
 *       200:
 *         description: List of floors retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 floors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       floor:
 *                         type: string
 *                         example: "ชั้น 1"
 *       400:
 *         description: |
 *           ❌ **เกิดข้อผิดพลาด: ไม่ได้ส่ง `building` ใน URL**
 *           - ตัวอย่าง Response:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing building parameter"
 */
router.get("/floors", DropdownController.getFloors);

/**
 * @swagger
 * /api/dropdown/rooms:
 *   get:
 *     summary: Get rooms for a selected building and floor
 *     description: |
 *       - **ใช้ API นี้หลังจากเลือกอาคารและชั้น**
 *       - **ต้องส่ง `building` และ `floor` ใน Query Parameters**
 *       - ✅ **ตัวอย่าง URL ที่ถูกต้อง:** `/api/dropdown/rooms?building=ตึก A&floor=ชั้น 1`
 *       - ❌ **ถ้าไม่ส่ง `building` หรือ `floor` จะได้ Error 400**
 *     tags:
 *       - Dropdown
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           - **ชื่อของอาคารที่ต้องการดึงห้อง**
 *       - in: query
 *         name: floor
 *         schema:
 *           type: string
 *         required: true
 *         description: |
 *           - **ชั้นของอาคารที่ต้องการดึงห้อง**
 *     responses:
 *       200:
 *         description: List of rooms retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location_id:
 *                         type: integer
 *                         example: 1
 *                       room:
 *                         type: string
 *                         example: "101"
 *       400:
 *         description: |
 *           ❌ **เกิดข้อผิดพลาด: ไม่ได้ส่ง `building` หรือ `floor` ใน URL**
 *           - ตัวอย่าง Response:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing parameters"
 */
router.get("/rooms", DropdownController.getRooms);

/**
 * @swagger
 * /api/dropdown/issues:
 *   get:
 *     summary: Get issue types based on selected room
 *     description: |
 *       - **ใช้ API นี้หลังจากเลือกห้อง**
 *       - **ต้องส่ง `location_id` จาก API `/rooms`**
 *       - ✅ **ตัวอย่าง URL ที่ถูกต้อง:** `/api/dropdown/issues?location_id=1`
 *       - ❌ **ถ้าไม่ส่ง `location_id` จะได้ Error 400**
 *     tags:
 *       - Dropdown
 *     parameters:
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: |
 *           - **รหัส `location_id` ของห้องที่เลือก**
 *           - **ได้มาจาก API `/rooms`**
 *     responses:
 *       200:
 *         description: List of issues retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       issue_name:
 *                         type: string
 *                         example: "อุปกรณ์ชำรุด"
 *       400:
 *         description: |
 *           ❌ **เกิดข้อผิดพลาด: ไม่ได้ส่ง `location_id` ใน URL**
 *           - ตัวอย่าง Response:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing location_id parameter"
 */
router.get("/issues", DropdownController.getIssuesByRoom);

module.exports = router;
