const pool = require('../../config/db');


// เพิ่มผู้ใช้ใหม่
exports.createUser = async (username, password, full_name) => {
    const query = 'INSERT INTO users (username, password, full_name) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [username, password, full_name]);
    return result.rows[0];
};


// ดึงข้อมูลผู้ใช้จาก username
exports.getUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};
