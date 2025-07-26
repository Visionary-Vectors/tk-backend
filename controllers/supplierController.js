const supabase = require('../config/db');

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');



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


// Upload raw material with image
exports.uploadRawMaterial = async (req, res) => {
  const { supplierId } = req.params;
  const { name, quantity, unit } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const filePath = `materials/${file.filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('raw-material-images')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ message: 'Image upload failed', error: uploadError });
    }

    // Insert raw material using Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('raw_materials')
      .insert([
        {
          raw_material_name: name,
          quantity,
          unit,
          supplier_id: supplierId,
          created_at: new Date().toISOString(),
          rm_pictures: filePath
        }
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ message: 'Failed to insert raw material', error: insertError });
    }

    res.status(201).json({
      message: 'Raw material uploaded successfully',
      rawMaterial: insertData
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
};

// Generate signed URL (optional)
exports.getSignedImageUrl = async (req, res) => {
  const { filepath } = req.params; // should be like materials/filename.jpg

  const { data, error } = await supabase.storage
    .from('raw-material-images')
    .createSignedUrl(filepath, 60 * 60); // valid for 1 hour

  if (error) {
    return res.status(500).json({ message: 'Failed to generate signed URL', error });
  }

  res.json({ signedUrl: data.signedUrl });
};
