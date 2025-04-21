const db = require("../../config/db"); 

const DropdownModel = {
  // ดึงรายการอาคารทั้งหมด (Distinct)
  getBuildings: (callback) => {
    db.query("SELECT building FROM locations GROUP BY building ORDER BY MIN(id) ASC ", callback);
  },

  // ดึงรายการชั้น ตามอาคารที่เลือก
  getFloorsByBuilding: (building, callback) => {
    db.query("SELECT floor FROM locations WHERE building = $1 GROUP BY floor ORDER BY floor ASC ", 
      [building], callback);
  },

  // ดึงรายการห้อง ตามอาคารและชั้นที่เลือก (ใช้ id เป็น location_id)
  getRoomsByFloor: (building, floor, callback) => {
    db.query(
      "SELECT id AS location_id, room FROM locations WHERE building = $1 AND floor = $2 ORDER BY id ASC",
      [building, floor], callback);
  },

  // ดึงประเภทห้องโดยใช้ location_id
  getRoomTypeByLocation: (locationId, callback) => {
    db.query(
      "SELECT room_type_id FROM locations WHERE id = $1",
      [locationId], callback);
  },
  
  // หาทำเล (location) แรกของอาคาร
  getFirstLocationByBuilding: (building, callback) => {
    const query = `
      SELECT id FROM locations
      WHERE building = $1
      LIMIT 1
    `;
    db.query(query, [building], callback);
  },

  // ดึงปัญหาตามประเภทห้อง
  getIssuesByRoomType: (roomTypeId, callback) => {
    db.query(
      "SELECT i.category_name, i.id AS problem_id FROM issue_categories i JOIN issue_room_type irt ON i.id = irt.issue_id WHERE irt.room_type_id = $1",
      [roomTypeId], callback);
  }
};

module.exports = DropdownModel;
