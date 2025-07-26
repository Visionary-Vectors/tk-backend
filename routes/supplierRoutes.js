const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const supplierController = require('../controllers/supplierController');

// Upload raw material with image
router.post(
  '/:supplierId/uploadRawMaterials',
  upload.single('image'), // field name should be 'image' in form-data
  supplierController.uploadRawMaterial
);

router.get('/:supplier_id', supplierController.getSupplierById);


// Optionally, expose signed URL endpoint if needed
router.get(
  '/image/:filepath',
  supplierController.getSignedImageUrl
);

module.exports = router;
