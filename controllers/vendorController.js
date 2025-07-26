const supabase = require('../config/db');

exports.getVendorById = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('vendor')
      .select('*')
      .eq('vendor_id', vendor_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
// controllers/vendorController.js