const supabase = require('../config/db');

exports.getVendorOrders = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Vendor order fetch error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
