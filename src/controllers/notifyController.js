const { getAgentEmailsByDepartment, getAdminEmails } = require('../models/notifyModel');
const { sendIssueNotification } = require('../utils/mailer');

const notifyAgents = async (departmentId, issue , mode = "new") => {
  try {
    const emails = await getAgentEmailsByDepartment(departmentId);
    
    if (emails.length > 0) {
      await sendIssueNotification(emails, issue, mode);
    }
  } catch (err) {
    console.error('❌ notifyAgents error:' , err.message);
  }
};

const notifyAdmins = async (issue , mode = "new") => {
  try {
    const emails = await getAdminEmails();
    
    if (emails.length > 0) {
      await sendIssueNotification(emails, issue, mode);
    }
  } catch (err) {
    console.error('❌ notifyAdmins error:', err.message);
  }
};

module.exports = { notifyAgents , notifyAdmins };
