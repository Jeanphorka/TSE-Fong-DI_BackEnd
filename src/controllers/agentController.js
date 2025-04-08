const AgentModel = require('../models/agentModel');

const AgentController = {
  getAssignedIssues: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      const isAgent = role === "agent";
      if (!userId ) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!isAgent) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }

      // ดึง department_id ของ agent จาก user_id
      const deptResult = await AgentModel.getDepartmentIdByUserId(userId);
      if (!deptResult) {
        return res.status(404).json({ error: 'ไม่พบหน่วยงานของผู้ใช้' });
      }

      const departmentId = deptResult.department_id;

      // ดึงข้อมูล issue ตามหน่วยงาน
      const result = await AgentModel.getIssuesByDepartment(departmentId);
      res.status(200).json(result.rows);

    } catch (err) {
      console.error('getAssignedIssues error:', err.message);
      res.status(500).json({ error: 'ดึงข้อมูลล้มเหลว' });
    }
  }
};

module.exports = AgentController;
