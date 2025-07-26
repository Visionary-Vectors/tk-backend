const pool = require('../config/db'); // adjust path if needed

// GET /api/raw-materials
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
      LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id;
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching raw materials:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
