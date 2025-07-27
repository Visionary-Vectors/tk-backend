const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController'); // ✅ must be correct path

// ✅ Route for supplier orders
router.get('/:supplierId/orders', controller.getSupplierOrders);

module.exports = router;
