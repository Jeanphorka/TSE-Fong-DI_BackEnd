const { upload, deleteFileFromS3 } = require("../middlewares/uploadMiddleware");
const IssueReportModel = require("../models/issueReportModel");
const IssueLogModel = require("../models/issueLogModel");

const IssueReportController = {
  createIssueReport: [
    upload.array("images", 5),  //ใช้ Middleware จัดการอัปโหลดรูปภาพ
    async (req, res) => {
      try {
        const { problem_id, description, location_id } = req.body;
        const reporter_id = req.user?.userId;

        if (!reporter_id || !problem_id || !location_id) {
          return res.status(400).json({ error: "Missing required parameters" });
        }
        
        // รับ URL ของไฟล์ที่อัปโหลด
        const imageUrls = req.files?.length > 0
                ? req.files.map(file => ({
                    file_url: file.location,
                    file_extension: file.originalname.split(".").pop()
                }))
                : [];

        // บันทึกข้อมูลปัญหา
        const issue = await IssueReportModel.createIssueReport(reporter_id, problem_id, description || "", location_id);

        // สร้าง `transaction_id`
        const date = new Date(issue.created_at);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
        const transaction_id = `IS-${formattedDate}-${String(issue.id).padStart(4, '0')}`;

        // อัปเดต `transaction_id`
        await IssueReportModel.updateTransactionId(issue.id, transaction_id);

        // บันทึก Log "Created"
        const logEntry = await IssueLogModel.createIssueLog(reporter_id, issue.id, "created", "รอรับเรื่อง",null, null,imageUrls.length > 0, null, null);

        // บันทึกไฟล์ภาพที่อัปโหลด
        let uploadedImages = [];
        if (imageUrls.length > 0) {
          uploadedImages = await IssueReportModel.uploadIssueImages(issue.id, logEntry.id, reporter_id, imageUrls);
        }

        res.status(201).json({
          message: "Issue reported successfully",
          report: {
            id: issue.id,
            transaction_id,
            reporter_id,
            problem_id,
            description,
            status: "รอรับเรื่อง",
            location_id,
            created_at: issue.created_at,
            images: uploadedImages
          }
        });

      } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  ],

  getUserIssues: async (req, res) => {
    try {

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized", message: "User ID is missing" });
      }

      const issues = await IssueReportModel.getUserIssues(userId);
      res.status(200).json(issues);
    } catch (err) {
      console.error("Error fetching issues:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getIssueById: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role; 
      const { id } = req.params;
      

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized", message: "User ID is missing" });
      }

      if (!id) {
        return res.status(400).json({ error: "Missing issue ID" });
      }

      const issue = await IssueReportModel.getIssueById(id);

      if (!issue) {
        return res.status(404).json({ error: "Not Found", message: "Issue not found" });
      }

      // เงื่อนไขตรวจสอบการเข้าถึง
      const isOwner = String(issue.reporter_id) === String(userId);
      const isAdmin = role === "admin";
      const isAgent = role === "agent";
      const isDean = role === "รองคณบดี";

        
      if (!isOwner && !isAdmin && !isAgent && !isDean) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }

      res.status(200).json(issue);
    } catch (err) {
      console.error("Error fetching issue by ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

};

module.exports = IssueReportController;
