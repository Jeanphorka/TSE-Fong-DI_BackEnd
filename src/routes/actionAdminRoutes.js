const express = require('express');
const router = express.Router();
const ActionAdminController = require('../controllers/actionAdminController');
const authMiddleware = require('../middlewares/authMiddleware'); 

/**
 * @swagger
 * /api/action-admin/update/{id}:
 *   put:
 *     summary: อัปเดตสถานะของ Issue และอัปโหลดรูปภาพ
 *     description: ใช้สำหรับอัปเดตสถานะของปัญหา เช่น "กำลังดำเนินการ" หรือ "เสร็จสิ้น" และสามารถแนบรูปภาพเพิ่มเติมได้
 *     tags: [ActionAdmin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของปัญหาที่ต้องการอัปเดต
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["กำลังดำเนินการ", "เสร็จสิ้น"]
 *                 description: สถานะใหม่ของปัญหา (จำเป็นต้องส่งค่า)
 *                 example: "กำลังดำเนินการ"
 *               comment:
 *                 type: string
 *                 description: คำอธิบายของเจ้าหน้าที่เกี่ยวกับการเปลี่ยนสถานะ (ไม่จำเป็นต้องส่ง)
 *                 example: "กำลังดำเนินการตรวจสอบปัญหา"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: ไฟล์ภาพที่อัปโหลด (รองรับหลายไฟล์)
 *     responses:
 *       200:
 *         description: อัปเดตสถานะของ Issue สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Issue updated successfully"
 *                 issue:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "กำลังดำเนินการ"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       file_url:
 *                         type: string
 *                         example: "https://your-bucket.s3.amazonaws.com/image1.png"
 *                       file_extension:
 *                         type: string
 *                         example: "png"
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง (เช่น ไม่มี `status` หรืออัปโหลดไฟล์ผิดประเภท)
 *       401:
 *         description: Unauthorized (Token ไม่ถูกต้อง)
 *       404:
 *         description: ไม่พบ Issue ที่ต้องการอัปเดต
 *       500:
 *         description: Internal Server Error
 */
router.put('/update/:id', authMiddleware, ActionAdminController.updateIssueStatus);

/**
 * @swagger
 * /api/action-admin/delete/{id}:
 *   delete:
 *     summary: ลบรายงานปัญหาและไฟล์ที่เกี่ยวข้อง
 *     description: ใช้เพื่อลบ Issue ออกจากระบบ โดยจะลบไฟล์รูปภาพจาก S3 และฐานข้อมูลทั้งหมดที่เกี่ยวข้องกับ Issue นั้น ๆ โดยจะเก็บค่าlog delete ไว้แล้วเปลี่ยน issue id ที่ถูกลบเป็น null ทั้งหมด
 *     tags:
 *       - ActionAdmin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของปัญหาที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบ Issue สำเร็จ พร้อมลบรูปภาพที่เกี่ยวข้องจาก S3 และฐานข้อมูล โดยจะเก็บค่าlog delete ไว้แล้วเปลี่ยน issue id ที่ถูกลบเป็น null ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Issue report deleted successfully"
 *       401:
 *         description: Unauthorized (Token ไม่ถูกต้อง)
 *       404:
 *         description: ไม่พบ Issue ที่ต้องการลบ
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete/:id', authMiddleware, ActionAdminController.deleteIssueReport);

/**
 * @swagger
 * /api/action-admin/update-department/{id}:
 *   put:
 *     tags:
 *       - ActionAdmin
 *     summary: อัปเดตหน่วยงานที่รับผิดชอบของเคส
 *     description: อัปเดตช่อง assign_to ในตาราง issue โดยใช้ department_id และบันทึก log การมอบหมายให้หน่วยงาน
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: รหัสของเคสที่ต้องการอัปเดต
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_id
 *             properties:
 *               department_id:
 *                 type: integer
 *                 example: 3
 *                 description: รหัสหน่วยงานใหม่ที่ต้องการมอบหมายให้รับผิดชอบ
 *     responses:
 *       200:
 *         description: อัปเดตหน่วยงานสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: อัปเดตหน่วยงานสำเร็จ
 *                 assign_to:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: Unauthorized - ไม่พบ token หรือ token ไม่ถูกต้อง
 *       404:
 *         description: ไม่พบเคสหรือหน่วยงาน
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.put('/update-department/:id', authMiddleware, ActionAdminController.updateDepartment);

/**
 * @swagger
 * /api/action-admin/update-delete/{id}:
 *   put:
 *     tags:
 *       - ActionDean
 *     summary: เปลี่ยนสถานะลบของปัญหา
 *     description: อัปเดตฟิลด์ `delete` ของ issue โดยรับค่า `true` หรือ `false` ผ่าน request body
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของ issue ที่ต้องการเปลี่ยนสถานะลบ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: อัปเดตสถานะลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "อัปเดตสถานะลบสำเร็จ"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง เช่น id ไม่ใช่ตัวเลข หรือค่า isDeleted ไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์ใช้งาน
 *       500:
 *         description: ไม่สามารถอัปเดตข้อมูลได้เนื่องจากข้อผิดพลาดของเซิร์ฟเวอร์
 */
router.put('/update-delete/:id', authMiddleware, ActionAdminController.updateDeleteFlag);

module.exports = router;
