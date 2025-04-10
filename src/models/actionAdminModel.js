const pool = require("../../config/db");

const ActionAdminModel = {
  getIssueById: async (id) => {
    const query = `SELECT * FROM issues WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // ดึงรูปภาพที่เกี่ยวข้องกับ issue_id
  getIssueImages: async (issueId) => {
  return await pool.query(`SELECT file_url FROM issue_image WHERE issue_id = $1`, [issueId]);
  },

  updateIssue: async (id, status) => {
    const query = `
      UPDATE issues
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
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

  deleteIssue: async (id) => {
    try {
      // ลบรูปภาพที่เกี่ยวข้องก่อน
      await pool.query(`DELETE FROM issue_image WHERE issue_id = $1`, [id]);

      // เปลี่ยน `issue_id` ใน Log เป็น `NULL` 
      await pool.query(`UPDATE issue_log SET issue_id = NULL WHERE issue_id = $1`, [id]);

      // ลบ Issue จริง
      await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);

      // รีเซ็ต sequence ให้วิ่งต่อจาก MAX(id)
      await pool.query(
        `SELECT setval('issues_new_id_seq', (SELECT COALESCE(MAX(id), 0) FROM issues), true);`
    );
    } catch (error) {
      throw error;
    }
  },

  updateDepartment: async (issueId, departmentId) => {
    const result = await pool.query(
      'UPDATE issues SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING assigned_to',
      [departmentId, issueId]
    );
    return result.rows[0];
  },

  getDepartmentName: async (departmentId) => {
    const result = await pool.query(
      'SELECT name FROM departments WHERE id = $1',
      [departmentId]
    );
    return result.rows[0];
  }
};

module.exports = ActionAdminModel;
