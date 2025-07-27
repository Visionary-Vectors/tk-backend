const supabase = require('../config/db');

exports.getAllRawMaterials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('raw_material_id, raw_material_name, raw_material_quantity, unit, raw_material_price, created_at, supplier_id, suppliers(supplier_name)')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
