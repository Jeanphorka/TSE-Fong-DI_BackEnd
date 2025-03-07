const { upload, deleteFileFromS3 } = require("../middlewares/uploadMiddleware");
const actionAdminModel = require("../models/actionAdminModel");
const IssueLogModel = require("../models/issueLogModel");

const ActionAdminController = {
  updateIssueStatus: [
    upload.array("images", 1),  // ใช้ Middleware สำหรับอัปโหลดรูปภาพ
    async (req, res) => {
      try {
        const { id } = req.params; // รับ `issue_id`
        const { status, comment } = req.body; // รับค่าสถานะและคำอธิบายของเจ้าหน้าที่
        const adminId = req.user?.userId; // ดึง `adminId` จาก Token
        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        // ตรวจสอบว่า Issue มีอยู่จริงหรือไม่
        const existingIssue = await actionAdminModel.getIssueById(id);
        if (!existingIssue) {
          return res.status(404).json({ error: "Issue not found" });
        }

        // อัปเดต `status` ของ Issue
        const updatedIssue = await actionAdminModel.updateIssue(id, status);

        // ตรวจสอบ Action และ Timestamp
        let action;
        let ongoingat = null;
        let endat = null;

        if (status === "กำลังดำเนินการ") {
          action = "update";
          ongoingat = new Date().toISOString();
        } else if (status === "เสร็จสิ้น") {
          action = "complete";
          endat = new Date().toISOString();
        }

        // รับ URL ของไฟล์ที่อัปโหลด
        const imageUrls = req.files?.length > 0
          ? req.files.map(file => ({
              file_url: file.location,  // URL ของไฟล์
              file_extension: file.originalname.split(".").pop()
          }))
          : [];

        const has_images = imageUrls.length > 0;

        // บันทึก Log การเปลี่ยนแปลงของ Issue
        const logEntry = await IssueLogModel.createIssueLog(adminId, id, action, status, ongoingat, endat, has_images, comment);

        // บันทึกไฟล์ภาพที่อัปโหลด
        let uploadedImages = [];
        if (has_images) {
          uploadedImages = await actionAdminModel.uploadIssueImages(id, logEntry.id, adminId, imageUrls);
        }

        res.status(200).json({
          message: "Issue updated successfully",
          issue: {
            id: updatedIssue.id,
            status: updatedIssue.status,
            updated_at: updatedIssue.updated_at
          }
        });

      } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
    
  ],

  // ลบรายงาน
  deleteIssueReport: async (req, res) => {
    try {
      const { id } = req.params; // รับ `issue_id`
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      // ตรวจสอบว่า Issue มีอยู่จริง
      const existingIssue = await actionAdminModel.getIssueById(id);
      if (!existingIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      const { rows: imageRows } = await actionAdminModel.getIssueImages(id);
      
      //ลบภาพใน S3
      for (const row of imageRows) {
        await deleteFileFromS3(row.file_url); 
      }

      await IssueLogModel.createIssueLog(
        adminId,  // user_id (คนที่ลบ)
        id,  // issue_id
        "delete",  // action = "delete"
        null,  // status = null
        null,  // ongoingAt = null
        null,  // endAt = null
        false,  // has_images = false
        null,  // comment = null
        new Date().toISOString(),
      );

      // ลบ Issue จากฐานข้อมูล
      await actionAdminModel.deleteIssue(id);

      res.status(200).json({ message: "Issue report deleted successfully" });

    } catch (error) {
      console.error("Internal Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  
};

module.exports = ActionAdminController;
