const express = require('express');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const issueReportRoutes = require("./routes/issueReportRoutes");
const actionAdminRoutes = require("./routes/actionAdminRoutes");
const allReportRoutes = require("./routes/allReportRoute");
const departmentRoutes = require('./routes/departmentRoutes');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swaggerConfig');


const app = express();
app.use(cors());
app.use(express.json());

// เรียก Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/dropdown", dropdownRoutes);
app.use("/api/issue-reports", issueReportRoutes);
app.use("/api/action-admin", actionAdminRoutes);
app.use("/api/all-issue", allReportRoutes);
app.use('/api/departments', departmentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
