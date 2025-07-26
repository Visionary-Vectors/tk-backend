// db.js
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use env variable for security
  ssl: {
    rejectUnauthorized: false, // Required for Supabase SSL
  },
});

module.exports = pool;
