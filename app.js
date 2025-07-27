// app.js
const cors = require('cors');
const express = require('express');
const app = express();
const indexRoutes = require('./routes/indexRoutes');
const dbRoutes = require('./routes/dbRoutes');
const userRoutes = require('./routes/userRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

// Middleware
app.use(express.json()); // parse JSON request body
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', indexRoutes);
app.use('/db', dbRoutes);
app.use('/api', userRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);

// ✅ Fixed these two lines:
app.use('/api/vendors', vendorRoutes);      // will match /api/vendors/:vendorId/orders
app.use('/api/suppliers', supplierRoutes);  // will match /api/suppliers/:supplierId/orders

module.exports = app;
