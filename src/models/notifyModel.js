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

module.exports =  { getAgentEmailsByDepartment, getAdminEmails};
