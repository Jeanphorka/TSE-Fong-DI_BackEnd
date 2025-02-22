const db = require("../../config/db");

const IssueLogModel = {
  // บันทึก Log `"Created"`
  createIssueLog: (user_id, issue_id, action, status, timestamp) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO issue_log (user_id, issue_id, action, status, timestamp)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `;
      db.query(query, [user_id, issue_id, action, status, timestamp], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
};

module.exports = IssueLogModel;
