const db = require("../../config/db");

const specialModel = {
  approveSpecialCase: async (issueId) => {
    return await db.query(`
      UPDATE issues
      SET status = 'Reopened',
          review = NULL,
          comment = NULL,
          updated_at = NOW()
      WHERE id = $1 RETURNING *;
    `, [issueId]);
  },

  closeSpecialCase: async (issueId) => {
    return await db.query(`
      UPDATE issues
      SET closed = true,
          updated_at = NOW()
      WHERE id = $1 RETURNING *;
    `, [issueId]);
  }
};

module.exports = specialModel;
