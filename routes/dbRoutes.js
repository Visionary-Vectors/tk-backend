const express = require('express');
const router = express.Router();
const supabase = require('../config/db'); // ✅ Now this is the actual Supabase client

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('vendor').select('*');

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ message: 'Error fetching vendors', error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Unexpected server error', error: err.message });
  }
});

module.exports = router;
