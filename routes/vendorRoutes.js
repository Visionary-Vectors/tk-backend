const express = require('express');
const router = express.Router();

// ✅ This is missing in your code
const controller = require('../controllers/vendorController');

// ✅ Now this works
router.get('/:vendorId/orders', controller.getVendorOrders);

module.exports = router;
