const supabase = require('../config/db');

exports.getSupplierOrders = async (req, res) => {
  const { supplierId } = req.params;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('supplier_id', supplierId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Supplier order fetch error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
