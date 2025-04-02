const express = require('express');
const router = express.Router();
const issuesController = require('../controllers/issueDataController');

/**
 * @swagger
 * /api/issue-data:
 *   get:
 *     summary: Get all issue reports with detailed info
 *     description: Retrieve all issues with reporter, department, problem category, and location info.
 *     tags:
 *       - Issues
 *     responses:
 *       200:
 *         description: A list of issue reports with detailed information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   transaction_id:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   reporter_id:
 *                     type: integer
 *                   reporter_username:
 *                     type: string
 *                   reporter_fullname:
 *                     type: string
 *                   department_id:
 *                     type: integer
 *                   department_name:
 *                     type: string
 *                   category_id:
 *                     type: integer
 *                   category_name:
 *                     type: string
 *                   location_id:
 *                     type: integer
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   room:
 *                     type: string
 *       500:
 *         description: Internal Server Error
 */
router.get('/', issuesController.getAllIssues);

module.exports = router;