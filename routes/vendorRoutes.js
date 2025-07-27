const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.get('/:vendor_id', vendorController.getVendorById);
router.post('/:vendorId/createOrder', vendorController.createOrder);
router.patch('/:vendorId/:orderId/updateOrderQuantity', vendorController.updateOrderQuantitiesByVendor);
// router.get('/:vendorId/orders', vendorController.getAllOrdersByVendor);
router.get('/:vendorId/:orderId', vendorController.getOrderByVendor);
// DELETE /api/vendor/:vendorId/:orderId/deleteorder
router.delete('/:vendorId/:orderId/deleteorder', vendorController.deleteOrderByVendor);

module.exports = router;
