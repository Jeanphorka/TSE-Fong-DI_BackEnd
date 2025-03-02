const pool = require("../../config/db"); 

const getAllReports = async () => {
    try {
      const query = `
        SELECT 
          i.id,
          i.transaction_id,
          i.created_at,
          (
          SELECT MAX(il2.endat) 
          FROM public.issue_log il2 
          WHERE il2.issue_id = i.id
          ) AS endat, 
          COALESCE(
            json_agg(DISTINCT ii.file_url) FILTER (WHERE ii.file_url IS NOT NULL), '[]'
          ) AS images,
          CONCAT(l.building, ' ', l.floor, ' ', l.room) AS location,
          ic.category_name,
          i.description,
          i.status
        FROM public.issues i
        LEFT JOIN public.issue_log il ON i.id = il.issue_id
        LEFT JOIN public.issue_image ii ON i.id = ii.issue_id AND ii.issue_log_id = il.id
        LEFT JOIN public.locations l ON i.location_id = l.id
        LEFT JOIN public.issue_categories ic ON i.problem_id = ic.id
        WHERE il.status = 'รอรับเรื่อง' 
        GROUP BY i.id, i.transaction_id, i.created_at, il.endat, l.building, l.floor, l.room, ic.category_name, i.description, i.status
        ORDER BY i.id ASC;
      `;
  
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  };

module.exports = { getAllReports };
