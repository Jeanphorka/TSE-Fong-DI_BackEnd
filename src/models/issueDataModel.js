const db = require('../../config/db');

async function getAllIssuesWithDetails() {
  const query = `
    SELECT 
      i.id,
      i.transaction_id,
      i.description,
      i.status,
      i.created_at,
      i.updated_at,
      
      -- Reporter Info
      u.id as reporter_id,
      u.username as reporter_username,
      u.full_name as reporter_fullname,
      
      -- Assigned Department Info
      d.id as department_id,
      d.name as department_name,

      -- Problem Category
      c.id as category_id,
      c.category_name,

      -- Location Info
      l.id as location_id,
      l.building,
      l.floor,
      l.room

    FROM issues i
    LEFT JOIN users u ON i.reporter_id = u.id
    LEFT JOIN departments d ON i.assigned_to = d.id
    LEFT JOIN issue_categories c ON i.problem_id = c.id
    LEFT JOIN locations l ON i.location_id = l.id
    ORDER BY i.id ASC
  `;

  const result = await db.query(query);
  return result.rows;
}

module.exports = {
  getAllIssuesWithDetails,
};
