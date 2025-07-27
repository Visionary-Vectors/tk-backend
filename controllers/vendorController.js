const supabase = require('../config/db');

exports.getVendorById = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('vendor')
      .select('*')
      .eq('vendor_id', vendor_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createOrder = async (req, res) => {
  const { vendorId } = req.params;
  const { orders } = req.body;
  // orders: [{ raw_material_id, order_quantity, order_unit }]
  if (!vendorId || !Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ message: 'Missing required fields or orders list is empty' });
  }

  const order_status = 'PENDING';
  const order_datetime = new Date().toISOString();
  const created_at = new Date().toISOString();

  try {
    let createdOrders = [];
    for (const item of orders) {
      const { raw_material_id, order_quantity, order_unit } = item;
      // 1. Get raw material info (including supplier_id)
      const { data: material, error } = await supabase
        .from('raw_materials')
        .select('raw_material_quantity, raw_material_price, supplier_id')
        .eq('raw_material_id', raw_material_id)
        .single();
      if (error || !material) {
        return res.status(404).json({ message: `Raw material ${raw_material_id} not found` });
      }
      if (material.raw_material_quantity < order_quantity) {
        return res.status(400).json({ message: `Insufficient quantity for raw material ${raw_material_id}` });
      }
      // 1b. Get supplier info
      const { data: supplierInfo, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('supplier_id', material.supplier_id)
        .single();
      if (supplierError || !supplierInfo) {
        return res.status(404).json({ message: `Supplier ${material.supplier_id} not found` });
      }
      // 2. Calculate order_amount
      const order_amount = (material.raw_material_price || 0) * (order_quantity || 0);
      // 3. Insert order row
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            vendor_id: vendorId,
            supplier_id: material.supplier_id,
            order_status,
            order_datetime,
            created_at,
            order_amount,
            order_quantity,
            order_unit
          }
        ])
        .select()
        .single();
      if (orderError || !orderData) {
        return res.status(500).json({ message: 'Failed to create order', error: orderError });
      }
      // Remove supplier_id from top-level order object in response
      const { supplier_id, ...orderDataWithoutSupplierId } = orderData;
      createdOrders.push({ ...orderDataWithoutSupplierId, supplier: supplierInfo });
      // 4. Reduce quantity in raw_materials
      await supabase
        .from('raw_materials')
        .update({ raw_material_quantity: material.raw_material_quantity - order_quantity })
        .eq('raw_material_id', raw_material_id)
        .eq('supplier_id', material.supplier_id);
    }
    return res.status(201).json({ message: 'Orders created successfully', orders: createdOrders });
  } catch (err) {
    console.error('Error creating orders:', err);
    return res.status(500).json({ message: 'Internal server error', error: err });
  }
};