const UserModel = require('../models/userModel');

const UserController = {
    getAllUsers: async (req, res) => {
        try {
          const role = req.user?.role;
          const adminId = req.user?.userId; // ดึง `adminId` จาก Token
          const isSuper = role === "superadmin";
          

          if (!adminId) {
            return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
          }

          if (!isSuper) {
            return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this user" });
          }
          
          const result = await UserModel.getAllUsers();
          const users = result.rows.map((row) => ({
            id: row.id,
            code: `Tse${row.id.toString().padStart(4, '0')}`, 
            username: row.username,
            full_name: row.full_name,
            role: row.role,
            department_id: row.department_id,
            department_name: row.department_name
          }));
      
          res.status(200).json(users);
        } catch (err) {
          console.error('❌ getAllUsers error:', err.message);
          res.status(500).json({ error: 'ดึงข้อมูลผู้ใช้ล้มเหลว' });
        }
    },

  createUser: async (req, res) => {
    const { username, fullName, role, departmentId } = req.body;
    
    try {
      const role1 = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isSuper = role === "superadmin";
      
        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        if (!isSuper) {
          return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this user" });
        }

      if (!username || !fullName || !role) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      }

      const { userId, rawcode } = await UserModel.createUser(username, fullName, role, departmentId);
      res.status(201).json({
        message: 'สร้างผู้ใช้สำเร็จ',
        userId,
        code: rawcode
      });
    } catch (err) {
      console.error('❌ createUser error:', err.message);
      res.status(500).json({ error: 'สร้างผู้ใช้ล้มเหลว' });
    }
  },

  updateUser: async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, fullName, role, departmentId } = req.body;

    try {
      const role1 = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isSuper = role === "superadmin";
      

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        if (!isSuper) {
          return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this user" });
        }
      await UserModel.updateUser(id, username, fullName, role, departmentId);
      res.status(200).json({ message: 'อัปเดตผู้ใช้สำเร็จ' });
    } catch (err) {
      console.error('❌ updateUser error:', err.message);
      res.status(500).json({ error: 'อัปเดตผู้ใช้ล้มเหลว' });
    }
  },

  getUserById: async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isSuper = role === "superadmin";
      

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        if (!isSuper) {
          return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this user" });
        }
      const result = await UserModel.getUserById(id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
    }
  },

  deleteUser: async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isSuper = role === "superadmin";
      

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        if (!isSuper) {
          return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this user" });
        }

      if (isNaN(id)) {
        return res.status(400).json({ error: 'รหัสผู้ใช้ไม่ถูกต้อง' });
      }
      // ลบความสัมพันธ์กับ agents (กรณี role = agent)
      await UserModel.deleteAgentByUserId(id);
  
      // ลบผู้ใช้จาก users
      await UserModel.deleteUser(id);
  
      return res.status(200).json({ message: 'ลบผู้ใช้เรียบร้อยแล้ว' });
    } catch (err) {
      console.error('❌ deleteUser error:', err.message);
      return res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้ได้' });
    }
  }
};

module.exports = UserController;
