const IssueReportModel = require("../models/issueReportModel");
const IssueLogModel = require("../models/issueLogModel");

const IssueReportController = {
  //  GET: ดึงข้อมูลเฉพาะของ User ที่ล็อกอิน
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

  // POST: สร้าง Issue Report
  createIssueReport: async (req, res) => {
    try {
      const { problem_id, description, location_id } = req.body;
      const reporter_id = req.user?.userId; // ดึงจากระบบ Login

      if (!reporter_id || !problem_id || !location_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // บันทึกข้อมูลปัญหา
      const issue = await IssueReportModel.createIssueReport(reporter_id, problem_id, description || "", location_id);

      // สร้าง `transaction_id`
      const date = new Date(issue.created_at);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
      const transaction_id = `IS-${formattedDate}-${String(issue.id).padStart(4, '0')}`;

      // อัปเดต `transaction_id`
      await IssueReportModel.updateTransactionId(issue.id, transaction_id);

      // บันทึก Log "Created"
      const timestamp = new Date().toISOString();
      await IssueLogModel.createIssueLog(reporter_id, issue.id, "Created", "Pending", timestamp);

      res.status(201).json({
        message: "Issue reported successfully",
        report: {
          id: issue.id,
          transaction_id,
          reporter_id,
          problem_id,
          description,
          status: "Pending",
          location_id,
          created_at: issue.created_at
        }
      });

    } catch (error) {
      console.error("Internal Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = IssueReportController;
