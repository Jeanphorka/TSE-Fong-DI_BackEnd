const { getAllReports } = require("../models/allReportModel");

const getAllReportsController = async (req, res) => {
  try {
    const reports = await getAllReports();
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllReportsController };
