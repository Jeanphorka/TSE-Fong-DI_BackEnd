const db = require("../../config/db");

const IssueLogModel = {
  // ✅ บันทึก Log `"Created"`, `"ดำเนินการ"`, `"เสร็จสิ้น"`
  createIssueLog: async (user_id, issue_id, action, status, timestamp, has_images = false, onGoingAt = null, endAt = null) => {
    try {
      const query = `
        INSERT INTO issue_log (user_id, issue_id, action, status, timestamp, has_images, onGoingAt, endAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
      `;
      const values = [user_id, issue_id, action, status, timestamp, has_images, onGoingAt, endAt];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },


};

module.exports = IssueLogModel;
