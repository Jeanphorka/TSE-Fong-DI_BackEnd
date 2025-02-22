const bcrypt = require('bcrypt');

/**
 * เข้ารหัสรหัสผ่าน
 * @param {string} password - รหัสผ่านที่ต้องการเข้ารหัส
 * @returns {Promise<string>} - รหัสผ่านที่ถูกเข้ารหัส
 */
async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

module.exports = { hashPassword };
