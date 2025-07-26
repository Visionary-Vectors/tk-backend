const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController');

router.get('/:supplier_id', controller.getSupplierById);

module.exports = router;
