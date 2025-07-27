const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.get('/:vendor_id', vendorController.getVendorById);
router.post('/:vendorId/createOrder', vendorController.createOrder);
router.patch('/:vendorId/:orderId/updateOrderQuantity', vendorController.updateOrderQuantitiesByVendor);

module.exports = router;
