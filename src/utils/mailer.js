const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendIssueNotification(toEmails, issue) {
  const mailOptions = {
    from: `"TSE FongDi" <${process.env.EMAIL_USER}>`,
    to: toEmails,
    subject: `📢 แจ้งเคสใหม่ในหน่วยงาน ${issue.departmentName}`,
    html: `
      <div style="font-family:sans-serif; line-height:1.6;">
        <h2 style="color:#d32f2f;">📌 แจ้งเคสใหม่เข้าระบบ</h2>
        <p><strong>รหัสเคส:</strong> ${issue.transaction_id}</p>
        <p><strong>หมวดหมู่:</strong> ${issue.title}</p>
        <p><strong>คำอธิบาย:</strong> ${issue.description}</p>
        <p><strong>สถานที่:</strong> ${issue.location}</p>
        <p><strong>หน่วยงาน:</strong> ${issue.departmentName}</p>
        <p style="margin-top:12px;">กรุณาเข้าสู่ระบบเพื่อตรวจสอบข้อมูล</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendIssueNotification };
