const pool = require('../../config/db');

// เพิ่มผู้ใช้ใหม่
exports.createUser = async (username, password, full_name, phone_number) => {
    const query = `
        INSERT INTO users (username, password, full_name, phone_number, created_at, updated_at, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [username, password, full_name, phone_number, new Date(), new Date(), 'user'];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// ดึงข้อมูลผู้ใช้จาก username
exports.getUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};