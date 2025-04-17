const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/authModel');
const { hashPassword } = require('../utils/passwordUtils');

const JWT_SECRET = process.env.JWT_SECRET;

// ฟังก์ชัน login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await userModel.getUserByUsername(username);
        if (!user) return res.status(401).json({ message: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

        // ตรวจสอบว่า JWT_SECRET ไม่เป็น undefined
        if (!JWT_SECRET) {
            throw new Error('Missing JWT_SECRET in environment variables');
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role 
            },
            JWT_SECRET
        );

        

        res.status(200).json({
            message: 'Login successful',
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
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// ฟังก์ชันสำหรับเพิ่มผู้ใช้ 
exports.createUser = async (req, res) => {
    const { username, password, full_name, phone_number } = req.body;

    // ตรวจสอบการกรอกข้อมูล
    if (!username || !password || !full_name || !phone_number) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // ตรวจสอบว่ามี username นี้อยู่ในระบบแล้วหรือไม่
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await hashPassword(password);

    // บันทึกข้อมูลผู้ใช้
    try {
        const user = await userModel.createUser(username, hashedPassword, full_name, phone_number);
        if (user) {
            res.status(201).json({ message: 'User created successfully', user });
        } else {
            res.status(500).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
};


