const pool = require("../../config/db");

const IssueReportModel = {
  // สร้างรายงานปัญหา พร้อมหาหน่วยงานที่รับผิดชอบโดยอัตโนมัติ
  createIssueReport: async (reporter_id, problem_id, description, location_id) => {
    const client = await pool.connect();
    try {

      // 1. สร้าง issue พร้อมสถานะ "รอรับเรื่อง"
      const insertQuery = `
        INSERT INTO issues (reporter_id, problem_id, description, location_id, status)
        VALUES ($1, $2, $3, $4, 'รอรับเรื่อง')
        RETURNING id, created_at, location_id;
      `;
      const issueResult = await client.query(insertQuery, [
        reporter_id,
        problem_id,
        description,
        location_id
      ]);

      const issue = issueResult.rows[0];

      // 2. หา building จาก location_id
      const locationRes = await client.query(
        'SELECT building FROM locations WHERE id = $1 LIMIT 1',
        [location_id]
      );

      if (locationRes.rows.length > 0) {
        const building = locationRes.rows[0].building;

        // 3. หา area_id ที่ตรงกับชื่ออาคาร
        const areaRes = await client.query(
          'SELECT id FROM areas WHERE name ILIKE $1 LIMIT 1',
          [`%${building}%`]
        );

        if (areaRes.rows.length > 0) {
          const area_id = areaRes.rows[0].id;

          // 4. ค้นหา department ที่รับผิดชอบพื้นที่นี้และปัญหานี้
          const deptRes = await client.query(`
            SELECT d.id
            FROM departments d
            JOIN department_areas da ON d.id = da.department_id
            JOIN department_issue_types dit ON d.id = dit.department_id
            WHERE da.area_id = $1 AND dit.issue_type_id = $2
            LIMIT 1
          `, [area_id, problem_id]);

          // 5. ถ้าพบ → อัปเดต assigned_to
          if (deptRes.rows.length > 0) {
            const deptId = deptRes.rows[0].id;
            await client.query(
              'UPDATE issues SET assigned_to = $1 WHERE id = $2',
              [deptId, issue.id]
            );
          }
        }
      }

      return issue;

    } catch (error) {
      throw error;
    } 
  },

  updateTransactionId: async (issue_id, transaction_id) => {
    try {
      const query = `UPDATE issues SET transaction_id = $1 WHERE id = $2 RETURNING *;`;
      const result = await pool.query(query, [transaction_id, issue_id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  uploadIssueImages: async (issue_id, issue_log_id, uploaded_by, imageUrls) => {
    try {
      const query = `
        INSERT INTO issue_image (issue_id, issue_log_id, file_url, uploaded_at, uploaded_by)
        VALUES ${imageUrls.map((_, i) => `($1, $2, $${i + 3}, NOW(), $${imageUrls.length + 3})`).join(", ")}
        RETURNING *;
      `;

      const values = [issue_id, issue_log_id, ...imageUrls.map(img => img.file_url), uploaded_by];

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  getUserIssues: async (userId) => {
    try {
        const query = `
          SELECT 
            ir.id, 
            ir.transaction_id, 
            u.username, 
            ir.description, 
            ic.category_name AS title,  
            ir.status,  
            loc.building,  
            loc.floor,     
            loc.room,      
            ir.created_at, 
            ir.updated_at,

            COALESCE(jsonb_agg(
                jsonb_build_object(
                    'status', il.status,
                    'description', 
                      CASE
                          WHEN il.status = 'รอรับเรื่อง' THEN ir.description
                          ELSE il.comment
                      END,
                    'updated_at', 
                      CASE 
                          WHEN il.status = 'กำลังดำเนินการ' THEN il.ongoingat
                          WHEN il.status = 'เสร็จสิ้น' THEN il.endat
                          ELSE ir.created_at
                      END,
                    'images', 
                        (SELECT COALESCE(jsonb_agg(ii.file_url), '[]') 
                        FROM issue_image ii 
                        WHERE ii.issue_log_id = il.id)
                ) ORDER BY 
        CASE 
            WHEN il.status = 'รอรับเรื่อง' THEN 1  
            WHEN il.status = 'กำลังดำเนินการ' THEN 2  
            WHEN il.status = 'เสร็จสิ้น' THEN 3  
            ELSE 4 
        END,
        il.ongoingat ASC  
            ), '[]') AS status_updates

        FROM issues ir
        LEFT JOIN issue_categories ic ON ir.problem_id = ic.id
        LEFT JOIN users u ON ir.reporter_id = u.id
        LEFT JOIN locations loc ON ir.location_id = loc.id
        LEFT JOIN issue_log il ON ir.id = il.issue_id
        WHERE ir.reporter_id = $1
        GROUP BY ir.id, ir.transaction_id, u.username, ir.description,  
                ic.category_name, ir.status, loc.building, loc.floor, 
                loc.room, ir.created_at, ir.updated_at
        ORDER BY ir.created_at DESC;
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
  },

  getIssueById: async (id) => {
    try {
      const query = `
        SELECT 
          ir.id, 
          ir.transaction_id,
          ir.reporter_id, 
          u.username, 
          ir.description, 
          ic.category_name AS title,  
          ir.status,  
          loc.building,  
          loc.floor,     
          loc.room,      
          ir.created_at, 
          ir.updated_at,

          COALESCE(jsonb_agg(
              jsonb_build_object(
                  'status', il.status,
                  'description', 
                    CASE
                        WHEN il.status = 'รอรับเรื่อง' THEN ir.description
                        ELSE il.comment
                    END,
                  'updated_at', 
                    CASE 
                        WHEN il.status = 'กำลังดำเนินการ' THEN il.ongoingat
                        WHEN il.status = 'เสร็จสิ้น' THEN il.endat
                        ELSE ir.created_at
                    END,
                  'images', 
                      (SELECT COALESCE(jsonb_agg(ii.file_url), '[]') 
                      FROM issue_image ii 
                      WHERE ii.issue_log_id = il.id)
              ) ORDER BY 
      CASE 
          WHEN il.status = 'รอรับเรื่อง' THEN 1  
          WHEN il.status = 'กำลังดำเนินการ' THEN 2  
          WHEN il.status = 'เสร็จสิ้น' THEN 3  
          ELSE 4 
      END,
      il.ongoingat ASC 
          ), '[]') AS status_updates

      FROM issues ir
      LEFT JOIN issue_categories ic ON ir.problem_id = ic.id
      LEFT JOIN users u ON ir.reporter_id = u.id
      LEFT JOIN locations loc ON ir.location_id = loc.id
      LEFT JOIN issue_log il ON ir.id = il.issue_id
      WHERE ir.id = $1
      GROUP BY ir.id, ir.transaction_id, ir.reporter_id, u.username, ir.description,  
              ic.category_name, ir.status, loc.building, loc.floor, 
              loc.room, ir.created_at, ir.updated_at
      ORDER BY ir.created_at DESC;
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
  } catch (error) {
      throw error;
  }
}
  
};

module.exports = IssueReportModel;
