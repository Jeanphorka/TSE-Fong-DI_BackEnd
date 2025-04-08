const db = require('../../config/db');

const AgentModel = {
  getDepartmentIdByUserId: async (userId) => {
    const result = await db.query(
      'SELECT department_id FROM agents WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  },

  getIssuesByDepartment: async (departmentId) => {
    const query = `
      SELECT 
        i.id,
        i.transaction_id,
        i.created_at,
        (
          SELECT MAX(il2.endat) 
          FROM public.issue_log il2 
          WHERE il2.issue_id = i.id
        ) AS endat, 
        COALESCE(
          json_agg(DISTINCT ii.file_url) FILTER (WHERE ii.file_url IS NOT NULL), '[]'
        ) AS images,
        CONCAT(l.building, ' ', l.floor, ' ', l.room) AS location,
        ic.category_name,
        i.description,
        i.status,
        d.id AS department_id,
        d.name AS department_name
      FROM public.issues i
      LEFT JOIN public.issue_log il ON i.id = il.issue_id
      LEFT JOIN public.issue_image ii ON i.id = ii.issue_id AND ii.issue_log_id = il.id
      LEFT JOIN public.locations l ON i.location_id = l.id
      LEFT JOIN public.issue_categories ic ON i.problem_id = ic.id
      LEFT JOIN departments d ON i.assigned_to = d.id
      WHERE i.assigned_to = $1
        AND il.status = 'รอรับเรื่อง'
      GROUP BY i.id, i.transaction_id, i.created_at, il.endat, l.building, l.floor, l.room, ic.category_name, i.description, i.status, d.id, d.name
      ORDER BY i.id ASC;
    `;
    return db.query(query, [departmentId]);
  }
};

module.exports = AgentModel;
