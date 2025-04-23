const { getAgentEmailsByDepartment } = require('../models/notifyModel');
const { sendIssueNotification } = require('../utils/mailer');

const notifyAgents = async (departmentId, issue , mode = "new") => {
  try {
    const emails = await getAgentEmailsByDepartment(departmentId);
    
    if (emails.length > 0) {
      await sendIssueNotification(emails, issue, mode);
    }
  } catch (err) {
    console.error('❌ notifyAgents error:', err.message);
  }
};

module.exports = { notifyAgents };
