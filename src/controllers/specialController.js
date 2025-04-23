const specialModel = require("../models/specialModels");
const IssueLogModel = require("../models/issueLogModel");
const IssueReportModel = require("../models/issueReportModel");
const { notifyAgents } = require('../controllers/notifyController');


const specialController = {
  specialAction: async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user?.userId;
    const role = req.user?.role;
    const isDean = role === "รองคณบดี";

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isDean ) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to this action" });
      }

    if (!["approve", "close"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    try {
      if (action === "approve") {
        const updated = await specialModel.approveSpecialCase(id);

        // ส่งการแจ้งเตือนให้กับเจ้าหน้าที่ที่รับผิดชอบ
        const fullIssue = await IssueReportModel.getIssueById(id);
        
        await notifyAgents(
          fullIssue.assigned_to,
          {
            transaction_id: fullIssue.transaction_id,
            title: fullIssue.title, // category_name
            description: fullIssue.description,
            location: `อาคาร ${fullIssue.building} ชั้น ${fullIssue.floor ?? ""} ห้อง ${fullIssue.room ?? ""}`,
            departmentName: fullIssue.department_name
          },
          "reopen" //เพิ่มโหมด 
        );

        await IssueLogModel.createIssueLog(
          userId,
          id,
          "review-approve",
          "Reopened",
          null,
          null,
          false,
          "อนุมัติให้เปิดเคสอีกครั้งจากรีวิวต่ำ"
        );

        return res.status(200).json({
          message: "เคสถูกอนุมัติและเปิดใหม่แล้ว",
          updated: updated.rows[0]
        });
      }

      //  หากเป็น close → เปลี่ยน status เป็น Closed
      const closed = await specialModel.closeSpecialCase(id);

      await IssueLogModel.createIssueLog(
        userId,
        id,
        "review-close",
        "Closed",
        null,
        null,
        false,
        "ปิดเคสจากหน้ารีวิวต่ำ"
      );

      return res.status(200).json({
        message: "ปิดเคสจากรีวิวต่ำเรียบร้อยแล้ว",
        updated: closed.rows[0]
      });

    } catch (err) {
      console.error("❌ specialAction error:", err.message);
      res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะได้" });
    }
  }
};

module.exports = specialController;
