// app.js
const express = require('express');
const app = express();
const indexRoutes = require('./routes/indexRoutes');

// Middleware
app.use(express.json()); // parse JSON request body

// Routes
app.use('/', indexRoutes);

module.exports = app;
