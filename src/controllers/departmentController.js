const DepartmentModel = require('../models/departmentModel');

const DepartmentController = {
  createDepartment: async (req, res) => {
    const { name, areaIds, issueTypeIds } = req.body;
    const role = req.user?.role;
    const adminId = req.user?.userId; // ดึง `adminId` จาก Token
    const isAdmin = role === "admin";
    

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
    }

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this" });
    }

    if (!name || !Array.isArray(areaIds) || !Array.isArray(issueTypeIds)) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อหน่วยงาน, พื้นที่ และประเภทปัญหา' });
    }

    if (!areaIds.length || !issueTypeIds.length) {
        return res.status(400).json({ error: 'ต้องเลือกอย่างน้อย 1 พื้นที่ และ 1 ประเภทปัญหา' });
      }

    try {
      // ตรวจชื่อซ้ำ
      const existing = await DepartmentModel.checkDuplicateName(name);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'ชื่อหน่วยงานนี้ถูกใช้แล้ว' });
      }

      // ตรวจว่าคู่ area+issue_type ถูกใช้ไปแล้วหรือยัง
      const conflict = await DepartmentModel.checkConflictPairs(areaIds, issueTypeIds);
      if (conflict.rows.length > 0) {
        return res.status(400).json({ error: 'มีพื้นที่และประเภทปัญหานี้ในหน่วยงานอื่นแล้ว' });
      }

      // เพิ่มหน่วยงาน
      const result = await DepartmentModel.createDepartment(name);
      const departmentId = result.rows[0].id;

      // เพิ่มความสัมพันธ์กับพื้นที่
      await DepartmentModel.insertDepartmentAreas(departmentId, areaIds);

      // เพิ่มความสัมพันธ์กับประเภทปัญหา
      await DepartmentModel.insertDepartmentIssueTypes(departmentId, issueTypeIds);

      return res.status(201).json({
        message: 'เพิ่มหน่วยงานสำเร็จ'
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateDepartment: async (req, res) => {
    const departmentId = parseInt(req.params.id);
    const { name, areaIds, issueTypeIds } = req.body;
    const role = req.user?.role;
    const adminId = req.user?.userId; // ดึง `adminId` จาก Token
    const isAdmin = role === "admin";
    

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
    }

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this" });
    }
  
    if (!name || !Array.isArray(areaIds) || !Array.isArray(issueTypeIds)) {
      return res.status(400).json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
    }


    if (!areaIds.length || !issueTypeIds.length) {
        return res.status(400).json({ error: 'ต้องเลือกอย่างน้อย 1 พื้นที่ และ 1 ประเภทปัญหา' });
      }

    try {
      // ตรวจชื่อซ้ำ (ยกเว้นตัวเอง)
      const existing = await DepartmentModel.checkDuplicateName(name);
      if (existing.rows.length > 0 && existing.rows[0].id !== departmentId) {
        return res.status(400).json({ error: 'ชื่อหน่วยงานนี้ถูกใช้แล้ว' });
      }
  
      // ตรวจว่าคู่ area + issueType มีหน่วยงานอื่นดูแลอยู่หรือไม่
      const conflict = await DepartmentModel.checkConflictPairsExcludingDept(
        departmentId,
        areaIds,
        issueTypeIds
      );
      if (conflict.rows.length > 0) {
        return res.status(400).json({ error: 'มีพื้นที่และประเภทปัญหานี้ในหน่วยงานอื่นแล้ว' });
      }
  
      // อัปเดตชื่อ
      await DepartmentModel.updateDepartmentName(departmentId, name);
  
      // ลบความสัมพันธ์เดิม
      await DepartmentModel.deleteDepartmentAreas(departmentId);
      await DepartmentModel.deleteDepartmentIssueTypes(departmentId);
  
      // เพิ่มความสัมพันธ์ใหม่
      await DepartmentModel.insertDepartmentAreas(departmentId, areaIds);
      await DepartmentModel.insertDepartmentIssueTypes(departmentId, issueTypeIds);
  
      return res.status(200).json({ message: 'อัปเดตข้อมูลหน่วยงานสำเร็จ' });
  
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteDepartment: async (req, res) => {
    const departmentId = parseInt(req.params.id);
    const role = req.user?.role;
    const adminId = req.user?.userId; // ดึง `adminId` จาก Token
    const isAdmin = role === "admin";
    

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
    }

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this " });
    }
  
    if (isNaN(departmentId)) {
      return res.status(400).json({ error: 'รหัสหน่วยงานไม่ถูกต้อง' });
    }
  
    try {
      await DepartmentModel.deleteDepartment(departmentId);
      return res.status(200).json({ message: 'ลบหน่วยงานเรียบร้อยแล้ว' });
    } catch (err) {
      return res.status(500).json({ error: 'ไม่สามารถลบหน่วยงานได้' });
    }
  },

  getDepartmentOptions: async (req, res) => {
    try {
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isAdmin = role === "admin";
      

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this " });
      }

      const [areasResult, issuesResult] = await Promise.all([
        DepartmentModel.getAllAreas(),
        DepartmentModel.getAllIssueTypes()
      ]);
  
      res.status(200).json({
        areas: areasResult.rows,
        issueTypes: issuesResult.rows
      });
  
    } catch (err) {
      res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลพื้นที่และประเภทปัญหาได้' });
    }
  },

  getAllDepartments: async (req, res) => {
    try {
      const result = await DepartmentModel.getAllDepartmentsWithRelations();
      const rows = result.rows;
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isAdmin = role === "admin";
      

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this " });
      }
  
      // กลุ่มข้อมูลตาม department_id
      const grouped = {};
  
      for (const row of rows) {
        const id = row.department_id;
  
        if (!grouped[id]) {
          grouped[id] = {
            id,
            name: row.department_name,
            areas: [],
            issueTypes: []
          };
        }
  
        // เพิ่มพื้นที่ (ไม่ซ้ำ)
        if (row.area_id && !grouped[id].areas.some(a => a.id === row.area_id)) {
          grouped[id].areas.push({ id: row.area_id, name: row.area_name });
        }
  
        // เพิ่มประเภทปัญหา (ไม่ซ้ำ)
        if (row.issue_type_id && !grouped[id].issueTypes.some(i => i.id === row.issue_type_id)) {
          grouped[id].issueTypes.push({ id: row.issue_type_id, name: row.issue_type_name });
        }
      }
  
      res.status(200).json(Object.values(grouped));
    } catch (err) {
      console.error('❌ Get departments failed:', err.message);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน' });
    }
  },

  getDepartmentById: async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const result = await DepartmentModel.getDepartmentWithRelations(id);
      const rows = result.rows;
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isAdmin = role === "admin";
      

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this " });
      }
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบหน่วยงานนี้' });
      }
  
      const department = {
        id: rows[0].department_id,
        name: rows[0].department_name,
        areas: [],
        issueTypes: []
      };
  
      const areaSet = new Set();
      const issueSet = new Set();
  
      for (const row of rows) {
        if (row.area_id && !areaSet.has(row.area_id)) {
          department.areas.push({ id: row.area_id, name: row.area_name });
          areaSet.add(row.area_id);
        }
  
        if (row.issue_type_id && !issueSet.has(row.issue_type_id)) {
          department.issueTypes.push({ id: row.issue_type_id, name: row.issue_type_name });
          issueSet.add(row.issue_type_id);
        }
      }
  
      res.status(200).json(department);
    } catch (err) {
      console.error('❌ getDepartmentById error:', err.message);
      res.status(500).json({ error: 'ดึงข้อมูลหน่วยงานล้มเหลว' });
    }
  }
  
};

module.exports = DepartmentController;
