const db = require('../../config/db');
const { hashPassword } = require('../utils/passwordUtils');

const UserModel = {
  getAllUsers: () => {
    return db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.role, 
        d.id AS department_id, 
        d.name AS department_name
      FROM users u
      LEFT JOIN agents a ON u.id = a.user_id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE u.role IN ('admin', 'agent' , 'รองคณบดี' ,'superadmin')
      ORDER BY u.id ASC
    `);
  },

  getAgentUsers: () => {
    return db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.role, 
        d.id AS department_id, 
        d.name AS department_name
      FROM users u
      LEFT JOIN agents a ON u.id = a.user_id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE u.role = 'agent'
      ORDER BY u.id ASC
    `);
  },

  createUser: async (username, fullName, role, departmentId) => {
    // 1. สร้าง password รูปแบบ Tse000X
    const countResult = await db.query(`SELECT COUNT(*) FROM users`);
    const userCount = parseInt(countResult.rows[0].count, 10) + 1;
    const rawcode = `Tse${userCount.toString().padStart(4, '0')}`;
    const hashedPassword = await hashPassword(rawcode);

    // 2. เพิ่มผู้ใช้
    const result = await db.query(
      `INSERT INTO users (username, full_name, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [username, fullName, hashedPassword, role]
    );

    const userId = result.rows[0].id;

    // 3. ถ้าเป็น agent → ผูกกับหน่วยงาน
    if (role === 'agent' && departmentId) {
      await db.query(
        'INSERT INTO agents (user_id, department_id) VALUES ($1, $2)',
        [userId, departmentId]
      );
    }
    return { userId, rawcode };
  },

  updateUser: async (id, username, fullName, role, departmentId) => {
    // 1. อัปเดต users table
    await db.query(
      `UPDATE users SET username = $1, full_name = $2, role = $3, updated_at = NOW() WHERE id = $4`,
      [username, fullName, role, id]
    );
  
    // 2. ถ้าเป็น agent → จัดการ agents table
    if (role === 'agent') {
      const existing = await db.query('SELECT * FROM agents WHERE user_id = $1', [id]);
  
      if (existing.rows.length > 0) {
        await db.query(
          'UPDATE agents SET department_id = $1 WHERE user_id = $2',
          [departmentId, id]
        );
      } else {
        await db.query(
          'INSERT INTO agents (user_id, department_id) VALUES ($1, $2)',
          [id, departmentId]
        );
      }
    } else {
      // 3. ถ้าไม่ใช่ agent → ลบออกจาก agents
      await db.query('DELETE FROM agents WHERE user_id = $1', [id]);
    }
  },

  getUserById: (id) => {
    return db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.role, 
        d.id AS department_id, 
        d.name AS department_name
      FROM users u
      LEFT JOIN agents a ON u.id = a.user_id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE u.id = $1
    `, [id]);
  },

  deleteAgentByUserId: async (id) => {
    await db.query('DELETE FROM agents WHERE user_id = $1', [id]);
  },
  
  deleteUser: async (id) => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    // รีเซ็ต sequence ให้วิ่งต่อจาก MAX(id)
    await db.query(
        `SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true);`
  );
  },

 
};

module.exports = UserModel;
