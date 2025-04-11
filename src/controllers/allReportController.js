const { getAllReports } = require("../models/allReportModel");

const getAllReportsController = async (req, res) => {
  try {
    const role = req.user?.role;
    const adminId = req.user?.userId; // ดึง `adminId` จาก Token
    const isAdmin = role === "admin";
    const isDean = role === "รองคณบดี";

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
    }

    if (!isAdmin && !isDean ) {
      return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
    }
    const reports = await getAllReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllReportsController };
