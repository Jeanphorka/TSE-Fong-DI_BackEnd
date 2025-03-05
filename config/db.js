const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    // user: process.env.DB_USER,
    // host: process.env.DB_HOST,
    // database: process.env.DB_NAME,
    // password: String(process.env.DB_PASSWORD), 
    // port: process.env.DB_PORT,
    connectionString: process.env.DATABASE_URL, // ใช้ DATABASE_URL จาก Render
    ssl: { rejectUnauthorized: false },
    
});

pool.connect()
    .then(() => console.log('✅ PostgreSQL connected successfully'))
    .catch((err) => console.error('❌ Database connection failed:', err.message));

module.exports = pool;
