const ReviewModel = require("../models/reviewModel");
const IssueLogModel = require("../models/issueLogModel");
const IssueReportModel = require("../models/issueReportModel");
const specialModel = require("../models/specialModels");
const actionAdminModel = require("../models/actionAdminModel");
const { getUidByIssueId } = require('../models/notifyModel');
const { pushLineMessage } = require('../utils/lineNotify');
const { generateReviewSubmittedFlex } = require("../utils/flexTemplates");



const ReviewController = {
  submitReview: async (req, res) => {
    const { id } = req.params;
    const { review, comment } = req.body;
    const userId = req.user?.userId;

    try {

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const issue = await IssueReportModel.getIssueById(id);
    const isOwner = String(issue.reporter_id) === String(userId);

    if (!isOwner) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to review" });
      }

    const review = parseFloat(req.body.review);
    if (isNaN(review) || review < 1 || review > 5) {
      return res.status(400).json({ error: "กรุณาระบุคะแนนรีวิวระหว่าง 1 ถึง 5" });
    }

    await IssueLogModel.createIssueLog(
      req.user.userId,
      req.params.id,
      "review",
      null,
      null,
      null,
      false,
      `รีวิวคะแนน ${req.body.review} - ${req.body.comment || "ไม่มีความคิดเห็น"}`
    );

    if (review >= 3) {
      const closed = await specialModel.closeSpecialCase(id);

      await IssueLogModel.createIssueLog(
        userId,
        id,
        "review-close",
        "Closed",
        null,
        null,
        false,
        "ปิดเคส"
      );
    }else if (review < 3) {
      const updatedIssue = await actionAdminModel.updateIssue(id, "รอพิจารณา");

      await IssueLogModel.createIssueLog(
        userId,
        id,
        "review-open",
        "รอพิจารณา",
        null,
        null,
        false,
        "รอพิจารณาเคสจากรีวิวต่ำ"
      );
    }

      



      const updated = await ReviewModel.saveReview(id, review, comment);
      res.status(200).json({ message: "บันทึกรีวิวสำเร็จ", updated });
    } catch (error) {
      console.error("submitReview error:", error);
      res.status(500).json({ error: error.message });
    }

    const fullIssue = await IssueReportModel.getIssueById(id);
      const message = generateReviewSubmittedFlex(fullIssue);
      const uid = await getUidByIssueId(id);
      await pushLineMessage(uid, message);
  }
};

module.exports = ReviewController;