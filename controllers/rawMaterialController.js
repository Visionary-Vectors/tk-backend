const supabase = require('../config/db');

// Helper function to get signed URL for an image
async function getSignedImageUrl(filePath) {
  if (!filePath) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from('raw-material-images')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('Error in getSignedImageUrl:', err);
    return null;
  }
}

exports.getAllRawMaterials = async (req, res) => {
  try {
    // Get all raw materials
    const { data: rawMaterials, error } = await supabase
      .from('raw_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Add signed URLs to each raw material with an image
    const materialsWithSignedUrls = await Promise.all(
      rawMaterials.map(async (material) => {
        if (material.rm_pictures) {
          const imageUrl = await getSignedImageUrl(material.rm_pictures);
          return { ...material, image_url: imageUrl };
        }
        return material;
      })
    );

    res.status(200).json(materialsWithSignedUrls);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
