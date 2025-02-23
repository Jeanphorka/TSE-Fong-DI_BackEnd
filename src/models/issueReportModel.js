const pool = require("../../config/db");

const IssueReportModel = {
  createIssueReport: async (reporter_id, problem_id, description, location_id) => {
    try {
      const query = `
        INSERT INTO issues (reporter_id, problem_id, description, location_id, status)
        VALUES ($1, $2, $3, $4, 'Pending') RETURNING id, created_at;
      `;
      const result = await pool.query(query, [reporter_id, problem_id, description, location_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  updateTransactionId: async (issue_id, transaction_id) => {
    try {
      const query = `UPDATE issues SET transaction_id = $1 WHERE id = $2 RETURNING *;`;
      const result = await pool.query(query, [transaction_id, issue_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  getUserIssues: async (userId) => {
    try {
      const query = `
        SELECT 
          ir.id, 
          ir.transaction_id, 
          ir.reporter_id, 
          ir.assigned_to, 
          ir.description, 
          ir.problem_id, 
          ic.category_name AS problem_name,  
          ir.status, 
          ir.location_id, 
          loc.building,  
          loc.floor,     
          loc.room,      
          ir.created_at, 
          ir.updated_at
        FROM issues ir
        LEFT JOIN issue_categories ic ON ir.problem_id = ic.id
        LEFT JOIN locations loc ON ir.location_id = loc.id
        WHERE ir.reporter_id = $1
        ORDER BY ir.created_at DESC;
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = IssueReportModel;
