const pool = require('../../config/db');

// ดึงข้อมูลผู้ใช้จาก username
exports.getUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

// สร้าง user ใหม่จาก TU API (ถ้าไม่มีอยู่)
exports.createUserFromTU = async ({ username, full_name, role }) => {
    const result = await pool.query(
      `INSERT INTO users (username, full_name, role, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [username, full_name, role]
    );
    return result.rows[0];
  };
  