const supabase = require('../config/db');

exports.getAllRawMaterials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select(`
        *,
        suppliers (supplier_name)
      `);

    if (error) {
      console.error('Error fetching raw materials:', error);
      return res.status(500).json({ error: 'Error fetching raw materials', details: error.message });
    }

    // Transform the data to match the expected format
    const formattedData = data.map(item => ({
      raw_material_id: item.raw_material_id,
      raw_material_name: item.raw_material_name,
      quantity: item.quantity,
      unit: item.unit,
      created_at: item.created_at,
      supplier_id: item.supplier_id,
      supplier_name: item.suppliers?.supplier_name || null
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
