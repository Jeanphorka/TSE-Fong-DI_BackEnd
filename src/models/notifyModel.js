const db = require('../../config/db');

const getAgentEmailsByDepartment = async (departmentId) => {
  const result = await db.query(
    `SELECT u.username AS email
     FROM agents a
     JOIN users u ON a.user_id = u.id
     WHERE a.department_id = $1`,
    [departmentId]
  );
  return result.rows.map(row => row.email);
};

const getAdminEmails = async () => {
  const result = await db.query(
    `SELECT u.username AS email
     FROM users u
     WHERE u.role = 'admin' `,  
  );
  return result.rows.map(row => row.email);
};

const getUidByUserId = async (reportId) => {
  const result = await db.query(`
    SELECT u.uid
    FROM issues i
    JOIN users u ON u.id = i.reporter_id
    WHERE i.id = $1
  `, [reportId]);
  return result.rows[0]?.uid || null;
};

module.exports =  { getAgentEmailsByDepartment, getAdminEmails , getUidByUserId };
