const express = require('express');
const router = express.Router();
const supabase = require('../config/db'); // now using supabase client

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendor');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching vendors');
  }
});

module.exports = router;
