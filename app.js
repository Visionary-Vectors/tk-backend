// app.js
const cors = require('cors');
const express = require('express');
const app = express();
const indexRoutes = require('./routes/indexRoutes');
const dbRoutes = require('./routes/dbRoutes');
const userRoutes = require('./routes/userRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const vendorRoutes = require('./routes/vendorRoutes')
const supplierRoutes = require('./routes/supplierRoutes');



require('dotenv').config(); // Load environment variables


// Middleware
app.use(express.json()); // parse JSON request body
app.use(cors())

// Routes
app.use('/', indexRoutes);
app.use('/db', dbRoutes); // Route prefix
app.use('/api', userRoutes); // Route now handles /api/create_user
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/vendors/:vendor_id', vendorRoutes); // endpoint: /api/vendors/:vendor_id
app.use('/api/supplier', supplierRoutes);


module.exports = app;
