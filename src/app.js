const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const issueReportRoutes = require("./routes/issueReportRoutes");
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swaggerConfig');

const app = express();
app.use(express.json());

// เรียก Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api/dropdown", dropdownRoutes);
app.use("/api/issue-reports", issueReportRoutes);
// Routes
app.use('/api/auth', authRoutes);


const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
