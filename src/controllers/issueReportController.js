const IssueReportModel = require("../models/issueReportModel");
const IssueLogModel = require("../models/issueLogModel");

const IssueReportController = {
  createIssueReport: async (req, res) => {
    try {

      const { problem_id, description, location_id } = req.body;
      const reporter_id = req.user?.userId; // ดึงจากระบบ Login

      if (!reporter_id || !problem_id || !location_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // บันทึกข้อมูลปัญหา
      const issueResult = await IssueReportModel.createIssueReport(reporter_id, problem_id, description || "", location_id);
      const issue_id = issueResult.rows[0].id;
      const created_at = issueResult.rows[0].created_at;

      // สร้าง `transaction_id`
      const date = new Date(created_at);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
      const transaction_id = `IS-${formattedDate}-${String(issue_id).padStart(4, '0')}`;

      // อัปเดต `transaction_id`
      await IssueReportModel.updateTransactionId(issue_id, transaction_id);

      // บันทึก Log `"Created"`
      const timestamp = new Date().toISOString();
      await IssueLogModel.createIssueLog(reporter_id, issue_id, "Created", "Pending",timestamp);

      res.status(201).json({
        message: "Issue reported successfully",
        report: {
          id: issue_id,
          transaction_id,
          reporter_id,
          problem_id,
          description,
          status: "Pending",
          location_id,
          created_at
        }
      });

    } catch (error) {
      console.error("Internal Server Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = IssueReportController;
