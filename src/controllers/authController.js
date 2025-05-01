const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET;
const TU_API_URL = 'https://restapi.tu.ac.th/api/v1/auth/Ad/verify';
const TU_APPLICATION_KEY = process.env.TU_APPLICATION_KEY;

exports.login = async (req, res) => {
  const { UserName, PassWord, uid } = req.body;

  if (!UserName || !PassWord) {
    return res.status(400).json({ message: 'กรุณาระบุ username และ password' });
  }

  try {
    // ถ้าเป็นรหัสผ่านขึ้นต้นด้วย Tse → ให้ตรวจจาก DB (admin/agent)
    if (PassWord.startsWith('Tse')) {
      const user = await userModel.getUserByUsername(UserName);
      if (!user) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

      const isMatch = await bcrypt.compare(PassWord, user.password);
      if (!isMatch) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

      // ออก token
      const token = jwt.sign({
        userId: user.id,
        username: user.username,
        role: user.role,
      }, JWT_SECRET);


      return res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      });
    }

    // ถ้าไม่ใช่เจ้าหน้าที่ → ตรวจสอบผ่าน TU API
    const tuResponse = await axios.post(
      TU_API_URL,
      { UserName, PassWord },
      {
        headers: {
          'Application-Key': TU_APPLICATION_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = tuResponse.data;

    if (!data.status) {
      return res.status(401).json({ message: 'เข้าสู่ระบบล้มเหลว Usernameหรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (data.faculty && data.faculty !== 'คณะวิศวกรรมศาสตร์') {
      return res.status(403).json({ message: 'อนุญาตเฉพาะนักศึกษาคณะวิศวกรรมศาสตร์และบุคลากรเท่านั้น' });
    }

    // ตรวจสอบว่ามี user อยู่ในระบบหรือยัง
    let user = await userModel.getUserByUsername(data.username);

    if (!user) {
      // user ใหม่ → สร้างพร้อม uid
      const result = await userModel.createUserFromTU({
        username: data.username,
        full_name: data.displayname_th,
        role: 'user',
        uid: uid || null
      });
      user = result;
    } else if (uid) {
      // user เก่า → อัปเดต uid ทุกครั้ง
      await userModel.updateUidForUser(user.id, uid);
      user = await userModel.getUserByUsername(data.username);
    }
    

    // ออก token
    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      role: user.role,

    }, JWT_SECRET);

    return res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'เข้าสู่ระบบล้มเหลว', error: error.message });
  }
};
