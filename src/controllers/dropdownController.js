const DropdownModel = require("../models/dropdownModel");

const DropdownController = {
  //  ดึงอาคารทั้งหมด
  getBuildings: async (req, res) => {
    try {
      const results = await new Promise((resolve, reject) => {
        DropdownModel.getBuildings((err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      res.json({ buildings: results.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  //  ดึงชั้น ตามอาคารที่เลือก
  getFloors: async (req, res) => {
    try {
      const { building } = req.query;
      if (!building) return res.status(400).json({ error: "Missing building parameter" });

      const results = await new Promise((resolve, reject) => {
        DropdownModel.getFloorsByBuilding(building, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      res.json({ floors: results.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  //  ดึงห้อง ตามอาคารและชั้นที่เลือก (ส่ง location_id ด้วย)
  getRooms: async (req, res) => {
    try {
      const { building, floor } = req.query;
      if (!building || !floor) return res.status(400).json({ error: "Missing parameters" });

      const results = await new Promise((resolve, reject) => {
        DropdownModel.getRoomsByFloor(building, floor, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      res.json({ rooms: results.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  //  ดึงปัญหาตามห้องที่เลือก (ใช้ location_id)
  getIssuesByRoom: async (req, res) => {
    try {
      const { location_id } = req.query;
      if (!location_id) return res.status(400).json({ error: "Missing location_id parameter" });

      //  ดึง room_type_id ของห้องนั้นจาก location_id
      const roomTypeResults = await new Promise((resolve, reject) => {
        DropdownModel.getRoomTypeByLocation(location_id, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (roomTypeResults.rows.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      const roomTypeId = roomTypeResults.rows[0].room_type_id;

      //  ดึงรายการปัญหาที่เกี่ยวข้องกับ room_type_id
      const issuesResults = await new Promise((resolve, reject) => {
        DropdownModel.getIssuesByRoomType(roomTypeId, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      res.json({ issues: issuesResults.rows });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = DropdownController;
