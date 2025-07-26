const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');

// GET: /api/raw-materials
router.get('/', rawMaterialController.getAllRawMaterials);

module.exports = router;
