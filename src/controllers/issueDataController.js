const Issue = require('../models/issueDataModel');

async function getAllIssues(req, res) {
  try {
    const issues = await Issue.getAllIssuesWithDetails();
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error getting issues:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getAllIssues,
};
