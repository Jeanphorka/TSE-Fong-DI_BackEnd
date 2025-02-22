const db = require("../../config/db");

const IssueReportModel = {
  createIssueReport: (reporter_id, problem_id, description, location_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO issues (reporter_id, problem_id, description, location_id)
        VALUES ($1, $2, $3, $4) RETURNING id, created_at;
      `;
      db.query(query, [reporter_id, problem_id, description, location_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  updateTransactionId: (issue_id, transaction_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE issues SET transaction_id = $1 WHERE id = $2 RETURNING *;
      `;
      db.query(query, [transaction_id, issue_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
};

module.exports = IssueReportModel;
