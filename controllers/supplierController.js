const supabase = require('../config/db');

exports.getSupplierById = async (req, res) => {
  const { supplier_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', supplier_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching supplier:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
