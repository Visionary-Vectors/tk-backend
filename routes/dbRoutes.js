const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const { data: vendors, error } = await supabase
      .from('vendor')
      .select('*');
      
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Error fetching vendors', details: error.message });
    }
    
    res.json(vendors);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
