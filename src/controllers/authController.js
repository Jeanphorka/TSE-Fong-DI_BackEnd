const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET;
const TU_API_URL = 'https://restapi.tu.ac.th/api/v1/auth/Ad/verify';
const TU_APPLICATION_KEY = process.env.TU_APPLICATION_KEY;

// ฟังก์ชัน login ใหม่
exports.login = async (req, res) => {
    const { UserName, PassWord } = req.body;
  
    if (!UserName || !PassWord) {
      return res.status(400).json({ message: 'กรุณาระบุ username และ password' });
    }
  
    try {
      // เรียก TU API
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
        return res.status(401).json({ message: 'เข้าสู่ระบบล้มเหลว รหัสหรือรหัสผ่านไม่ถูกต้อง' });
      }

      if (data.faculty !== 'คณะวิศวกรรมศาสตร์' || data.Faculty_Name_Th !== 'คณะวิศวกรรมศาสตร์') {
        return res.status(403).json({ message: 'อนุญาตเฉพาะนักศึกษาและบุคลากรคณะวิศวกรรมศาสตร์เท่านั้น' });
      }
  
      // ตรวจสอบว่ามีในระบบหรือยัง
      let user = await userModel.getUserByUsername(data.username);
  
      if (!user) {
        // ถ้ายังไม่มี → เพิ่มเข้า DB
        const result = await userModel.createUserFromTU({
          username: data.username,
          full_name: data.displayname_th,
          role: 'user', 
        });
  
        user = result;
      }
  
      // ออก token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET
      );
  
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
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ', error: error.message });
    }
  };

// // ฟังก์ชันสำหรับเพิ่มผู้ใช้ 
// exports.createUser = async (req, res) => {
//     const { username, password, full_name, phone_number } = req.body;

//     // ตรวจสอบการกรอกข้อมูล
//     if (!username || !password || !full_name || !phone_number) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     // ตรวจสอบว่ามี username นี้อยู่ในระบบแล้วหรือไม่
//     const existingUser = await userModel.getUserByUsername(username);
//     if (existingUser) {
//         return res.status(409).json({ message: 'Username already exists' });
//     }

//     // เข้ารหัสรหัสผ่านก่อนบันทึก
//     const hashedPassword = await hashPassword(password);

//     // บันทึกข้อมูลผู้ใช้
//     try {
//         const user = await userModel.createUser(username, hashedPassword, full_name, phone_number);
//         if (user) {
//             res.status(201).json({ message: 'User created successfully', user });
//         } else {
//             res.status(500).json({ message: 'Failed to create user' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to create user' });
//     }
// };


