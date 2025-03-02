const db = require("../../config/db");

const IssueLogModel = {
  // บันทึก Log `"Created"`, `"ดำเนินการ"`, `"เสร็จสิ้น"`
  createIssueLog: async (user_id, issue_id, action, status, onGoingAt = null, endAt = null, has_images = false, comment = null, deleteat = null) => {
    try {
      const query = `
        INSERT INTO issue_log (user_id, issue_id, action, status, timestamp, onGoingAt, endAt, has_images, comment , deleteat)
            VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8 , $9 )
            RETURNING *;
      `;
      const values = [
        user_id, 
        issue_id, 
        action, 
        status, 
        onGoingAt ,  
        endAt ,       
        has_images, 
        comment,
        deleteat     
    ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  



};

module.exports = IssueLogModel;
