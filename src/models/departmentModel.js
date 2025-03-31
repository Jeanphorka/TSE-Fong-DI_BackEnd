const db = require('../../config/db');


const DepartmentModel = {
  // ตรวจสอบชื่อหน่วยงานซ้ำ
  checkDuplicateName: (name) => {
    return db.query('SELECT id FROM departments WHERE name = $1', [name]);
  },

  // ตรวจสอบคู่ area_id + issue_type_id ที่ซ้ำกันในหน่วยงานอื่น
  checkConflictPairs: (areaIds, issueTypeIds) => {
    const query = `
      SELECT da.area_id, dit.issue_type_id
      FROM department_areas da
      JOIN department_issue_types dit ON da.department_id = dit.department_id
      WHERE da.area_id = ANY($1::int[])
      AND dit.issue_type_id = ANY($2::int[])
    `;
    return db.query(query, [areaIds, issueTypeIds]);
  },

  // สร้างหน่วยงานใหม่
  createDepartment: (name) => {
    return db.query(
      'INSERT INTO departments (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
      [name]
    );
  },

  // เพิ่มพื้นที่ที่รับผิดชอบ
  insertDepartmentAreas: (departmentId, areaIds) => {
    const values = areaIds.map(areaId => `(${departmentId}, ${areaId})`).join(', ');
    return db.query(`INSERT INTO department_areas (department_id, area_id) VALUES ${values}`);
  },

  // เพิ่มประเภทปัญหาที่รับผิดชอบ
  insertDepartmentIssueTypes: (departmentId, issueTypeIds) => {
    const values = issueTypeIds.map(issueTypeId => `(${departmentId}, ${issueTypeId})`).join(', ');
    return db.query(`INSERT INTO department_issue_types (department_id, issue_type_id) VALUES ${values}`);
  },
  

  // update department
  updateDepartmentName: (id, name) => {
    return db.query(
      'UPDATE departments SET name = $1, updated_at = NOW() WHERE id = $2',
      [name, id]
    );
  },
  
  // ลบความสัมพันธ์พื้นที่เดิมของหน่วยงาน
  deleteDepartmentAreas: (departmentId) => {
    return db.query('DELETE FROM department_areas WHERE department_id = $1', [departmentId]);
  },
  
  // ลบความสัมพันธ์ประเภทปัญหาเดิมของหน่วยงาน
  deleteDepartmentIssueTypes: (departmentId) => {
    return db.query('DELETE FROM department_issue_types WHERE department_id = $1', [departmentId]);
  },
  
  //  ตรวจสอบว่ามีหน่วยงานอื่น (ยกเว้นตัวเอง) ใช้คู่ area + issue_type ซ้ำหรือไม่
  checkConflictPairsExcludingDept: (deptId, areaIds, issueTypeIds) => {
    const query = `
      SELECT da.area_id, dit.issue_type_id
      FROM department_areas da
      JOIN department_issue_types dit ON da.department_id = dit.department_id
      WHERE da.department_id != $1
        AND da.area_id = ANY($2::int[])
        AND dit.issue_type_id = ANY($3::int[])
    `;
    return db.query(query, [deptId, areaIds, issueTypeIds]);
  },

  // delete department
  deleteDepartment: async (id) => {
    // ลบความสัมพันธ์ก่อน (ถ้ามี foreign key constraint)
    await db.query('DELETE FROM department_areas WHERE department_id = $1', [id]);
    await db.query('DELETE FROM department_issue_types WHERE department_id = $1', [id]);
  
    // ลบตัวหน่วยงาน
    return db.query('DELETE FROM departments WHERE id = $1', [id]);
  },

  getAllAreas: () => {
    return db.query('SELECT id, name FROM areas ORDER BY id ASC');
  },
  
  getAllIssueTypes: () => {
    return db.query('SELECT id, category_name FROM issue_categories ORDER BY id ASC');
  },

  getAllDepartmentsWithRelations: async () => {
    const query = `
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        a.id AS area_id,
        a.name AS area_name,
        i.id AS issue_type_id,
        i.category_name AS issue_type_name
      FROM departments d
      LEFT JOIN department_areas da ON da.department_id = d.id
      LEFT JOIN areas a ON a.id = da.area_id
      LEFT JOIN department_issue_types dit ON dit.department_id = d.id
      LEFT JOIN issue_categories i ON i.id = dit.issue_type_id
      ORDER BY d.id;
    `;
    return db.query(query);
  }
  
  
};

module.exports = DepartmentModel;
