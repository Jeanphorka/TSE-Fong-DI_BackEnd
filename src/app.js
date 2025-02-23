const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swaggerConfig');

const app = express();
app.use(express.json());

// เรียก Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api/dropdown", dropdownRoutes);
// Routes
app.use('/api/auth', authRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
