const db = require('../../config/db');

exports.getAllWake = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM wake');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wake:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};