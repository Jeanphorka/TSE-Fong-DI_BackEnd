const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TSE-FONGDI Faculty Reporting API',
            version: '1.0.0',
            description: 'API documentation for the faculty reporting system'
        },
        servers: [
            {
                url: 'https://tse-fong-dibackend-production.up.railway.app/',
                description: 'My API Documentation'
            }
        ]
    },
    // ใช้ path.resolve() เพื่อชี้ไปที่ src/routes
    apis: [path.resolve(__dirname, '../src/routes/*.js')]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
