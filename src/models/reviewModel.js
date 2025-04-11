const db = require("../../config/db");

const ReviewModel = {
  saveReview: async (issueId, review, comment) => {
    const result = await db.query(
      `UPDATE issues SET review = $1, comment = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [review, comment, issueId]
    );
    return result.rows[0];
  }
};

module.exports = ReviewModel;
