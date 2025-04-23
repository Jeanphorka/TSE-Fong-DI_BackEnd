const express = require('express');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const issueReportRoutes = require("./routes/issueReportRoutes");
const actionAdminRoutes = require("./routes/actionAdminRoutes");
const allReportRoutes = require("./routes/allReportRoute");
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');
const reviewRoutes = require("./routes/reviewRoutes");
const specialRoutes = require("./routes/specialRoutes");

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swaggerConfig');

// CDN CSS

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Welcome to the API')
})

// เรียก Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs , {
    customCss:'.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL, }));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/dropdown", dropdownRoutes);
app.use("/api/issue-reports", issueReportRoutes);
app.use("/api/action-admin", actionAdminRoutes);
app.use("/api/all-issue", allReportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/review', reviewRoutes);
app.use("/api/special-action", specialRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📑 Swagger Docs: http://localhost:4000/api-docs`);
});

module.exports = app;
