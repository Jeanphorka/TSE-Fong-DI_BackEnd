const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendIssueNotification(toEmails, issue, mode = "new") {
  const isReopen = mode === "reopen";
  const isAssign = mode === "assign";

  const subject = isReopen
    ? `📢 เคส ${issue.transaction_id} ถูกเปิดใหม่อีกครั้งในหน่วยงาน ${issue.departmentName}`
    : isAssign
    ? `📢 เคส ${issue.transaction_id} ถูกมอบหมายใหม่ให้หน่วยงาน ${issue.departmentName}`
    : `📢 แจ้งเคสใหม่ในหน่วยงาน ${issue.departmentName}`;

  const title = isReopen
    ? '🔄 เคสถูกเปิดใหม่อีกครั้ง (Reopened)'
    : isAssign
    ? '📤 เคสถูกมอบหมายใหม่ (Assigned)'
    : '📌 แจ้งเคสใหม่เข้าระบบ';

  const message = isReopen
    ? 'เคสที่เคยเสร็จสิ้น ได้ถูกเปิดใหม่อีกครั้ง โปรดตรวจสอบและดำเนินการ'
    : isAssign
    ? 'เคสนี้ถูกมอบหมายให้หน่วยงานของท่าน โปรดดำเนินการ'
    : 'มีเคสใหม่เข้ามาในระบบ โปรดตรวจสอบและดำเนินการ';

  const mailOptions = {
    from: `"TSE FongDi" <${process.env.EMAIL_USER}>`,
    to: toEmails,
    subject,
    html: `
      <div style="font-family:sans-serif; line-height:1.6;">
        <h2 style="color:#8C181C;">${title}</h2>
        <p>${message}</p>
        <p><strong>รหัสเคส:</strong> ${issue.transaction_id}</p>
        <p><strong>หมวดหมู่:</strong> ${issue.title}</p>
        <p><strong>คำอธิบาย:</strong> ${issue.description}</p>
        <p><strong>สถานที่:</strong> ${issue.location}</p>
        <p><strong>หน่วยงาน:</strong> ${issue.departmentName}</p>
       <table cellspacing="0" cellpadding="0" style="margin-top: 20px;"> 
      <tr> 
        <td align="center" bgcolor="#d32f2f" style="border-radius: 6px;"> 
          <a href="https://tse-fongdi.vercel.app/AgentPage/LoginPage" 
             target="_blank" 
             style="font-size: 16px; font-family: sans-serif; color: #ffffff; text-decoration: none; padding: 10px 20px; display: inline-block;">
            🔑 เข้าสู่ระบบเพื่อตรวจสอบเคส
          </a> 
        </td> 
      </tr> 
    </table>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendIssueNotification };
