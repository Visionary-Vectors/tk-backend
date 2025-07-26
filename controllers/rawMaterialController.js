const supabase = require('../config/db');

exports.getAllRawMaterials = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        rm.raw_material_id,
        rm.raw_material_name,
        rm.quantity,
        rm.unit,
        rm.created_at,
        rm.supplier_id,
        s.supplier_name
      FROM raw_materials rm
      LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id
      ORDER BY rm.created_at DESC;
    `);

    res.status(200).json(data);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
