const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticate a user and receive a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "6510742643"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful, returns a token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing username or password.
 *       401:
 *         description: Invalid username or password.
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/createUser:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the system.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *             properties:
 *               username:
 *                 type: string
 *                 example: "6510742643"
 *               password:
 *                 type: string
 *                 example: "1234"
 *               full_name:
 *                 type: string
 *                 example: "Tse Fong-Di"
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Failed to create user.
 */
router.post('/createUser', authController.createUser);


module.exports = router;
