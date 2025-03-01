const pool = require("../../config/db");

const IssueReportModel = {
  createIssueReport: async (reporter_id, problem_id, description, location_id) => {
    try {
      const query = `
        INSERT INTO issues (reporter_id, problem_id, description, location_id, status)
        VALUES ($1, $2, $3, $4, 'รอรับเรื่อง') RETURNING id, created_at;
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

  uploadIssueImages: async (issue_id, issue_log_id, uploaded_by, imageUrls) => {
    try {
      const query = `
        INSERT INTO issue_image (issue_id, issue_log_id, file_url, uploaded_at, uploaded_by)
        VALUES ${imageUrls.map((_, i) => `($1, $2, $${i + 3}, NOW(), $${imageUrls.length + 3})`).join(", ")}
        RETURNING *;
      `;

      const values = [issue_id, issue_log_id, ...imageUrls.map(img => img.file_url), uploaded_by];

      const result = await pool.query(query, values);
      return result.rows;
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
            u.username, 
            ir.description, 
            ic.category_name AS title,  
            ir.status,  
            loc.building,  
            loc.floor,     
            loc.room,      
            ir.created_at, 
            ir.updated_at,

            COALESCE(jsonb_agg(
                jsonb_build_object(
                    'status', il.status,
                    'updated_at', 
                        CASE 
                            WHEN il.status = 'กำลังดำเนินการ' THEN il.ongoingat
                            WHEN il.status = 'เสร็จสิ้น' THEN il.endat
                            ELSE ir.created_at
                        END,
                    'images', 
                        (SELECT COALESCE(jsonb_agg(ii.file_url), '[]') 
                        FROM issue_image ii 
                        WHERE ii.issue_log_id = il.id)
                ) ORDER BY il.ongoingat ASC
            ), '[]') AS status_updates

        FROM issues ir
        LEFT JOIN issue_categories ic ON ir.problem_id = ic.id
        LEFT JOIN users u ON ir.reporter_id = u.id
        LEFT JOIN locations loc ON ir.location_id = loc.id
        LEFT JOIN issue_log il ON ir.id = il.issue_id
        WHERE ir.reporter_id = $1
        GROUP BY ir.id, ir.transaction_id, u.username, ir.description,  
                ic.category_name, ir.status, loc.building, loc.floor, 
                loc.room, ir.created_at, ir.updated_at
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
