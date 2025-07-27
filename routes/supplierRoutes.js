const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController'); // ✅ must be correct path

// ✅ Route for supplier orders
router.get('/:supplierId/orders', controller.getSupplierOrders);
const upload = require('../middleware/upload');
const supplierController = require('../controllers/supplierController');

// Upload raw material with image
router.post(
  '/:supplierId/uploadRawMaterials',
  upload.single('image'), // field name should be 'image' in form-data
  supplierController.uploadRawMaterial
);

router.get('/:supplier_id', supplierController.getSupplierById);

// Update raw material
router.patch('/:supplierId/updateRawMaterial', upload.single('image'), supplierController.updateRawMaterial);

// Update order status
router.patch('/:supplierId/:orderId/updateOrderStatus', supplierController.updateOrderStatus);

// Optionally, expose signed URL endpoint if needed
router.get(
  '/image/:filepath',
  supplierController.getSignedImageUrl
);

// Get all raw materials for a supplier
router.get('/:supplierId/rawMaterials', supplierController.getRawMaterialsBySupplier);

module.exports = router;
