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
  const created_at_value = new Date().toISOString(); // avoid variable hoisting issue

  try {
    let createdOrders = [];
    for (const item of orders) {
      const { raw_material_id, order_quantity, order_unit } = item;
      // 1. Get raw material info (including supplier_id)
      const { data: material, error } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('raw_material_id', raw_material_id)
        .single();
      if (error || !material) {
        return res.status(404).json({ message: `Raw material ${raw_material_id} not found` });
      }
      if (material.raw_material_quantity < order_quantity) {
        return res.status(400).json({ message: `Insufficient quantity for raw material ${raw_material_id}` });
      }
      // 1b. Get supplier info from material.supplier_id
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
      // 3. Insert order row (no supplier_id column, add raw_material_id)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            vendor_id: vendorId,
            raw_material_id: raw_material_id,
            order_status,
            order_datetime,
            created_at: created_at_value,
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
      // Response: include raw_material and supplier info, but omit unnecessary fields
      const { raw_material_quantity, unit, created_at, rm_pictures, supplier_id, ...materialSafe } = material;
      createdOrders.push({
        ...orderData,
        raw_material: materialSafe, // filtered raw_material info
        supplier: supplierInfo
      });
      // 4. Reduce quantity in raw_materials
      await supabase
        .from('raw_materials')
        .update({ raw_material_quantity: material.raw_material_quantity - order_quantity })
        .eq('raw_material_id', raw_material_id);
    }
    return res.status(201).json({ message: 'Orders created successfully', orders: createdOrders });
  } catch (err) {
    console.error('Error creating orders:', err);
    return res.status(500).json({ message: 'Internal server error', error: err });
  }
};

// PATCH /api/vendor/:vendorId/:orderId/updateOrderQuantity
exports.updateOrderQuantitiesByVendor = async (req, res) => {
  const { vendorId, orderId } = req.params;
  const { updates } = req.body; // Expecting: [{ raw_material_id, order_quantity }, ...]

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid updates array' });
  }

  try {
    let updatedOrders = [];

    for (const item of updates) {
      const { raw_material_id, order_quantity } = item;

      if (!raw_material_id || typeof order_quantity !== 'number') {
        updatedOrders.push({ raw_material_id, error: 'Invalid raw_material_id or order_quantity' });
        continue;
      }

      // Get raw material price and quantity
      const { data: material, error: matError } = await supabase
        .from('raw_materials')
        .select('raw_material_price, raw_material_quantity')
        .eq('raw_material_id', raw_material_id)
        .single();

      if (matError || !material) {
        updatedOrders.push({ raw_material_id, error: 'Raw material not found' });
        continue;
      }

      const pricePerUnit = material.raw_material_price || 0;
      const rawMaterialStock = material.raw_material_quantity || 0;

      // Get the current order row for this raw_material_id
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .select('order_quantity')
        .eq('order_id', orderId)
        .eq('vendor_id', vendorId)
        .eq('raw_material_id', raw_material_id)
        .single();

      if (orderError || !orderRow) {
        updatedOrders.push({ raw_material_id, error: 'Order not found' });
        continue;
      }

      const initialOrderQuantity = orderRow.order_quantity || 0;

      // CASE: Increase in quantity
      if (order_quantity > initialOrderQuantity) {
        const additionalNeeded = order_quantity - initialOrderQuantity;

        // Check if sufficient stock is available
        if (rawMaterialStock < additionalNeeded) {
          updatedOrders.push({
            raw_material_id,
            error: `Insufficient stock: need ${additionalNeeded}, available ${rawMaterialStock}`,
          });
          continue;
        }

        // Subtract additional stock
        await supabase
          .from('raw_materials')
          .update({ raw_material_quantity: rawMaterialStock - additionalNeeded })
          .eq('raw_material_id', raw_material_id);
      }

      // CASE: Decrease in quantity
      else if (order_quantity < initialOrderQuantity) {
        const excess = initialOrderQuantity - order_quantity;

        // Add back excess to stock
        await supabase
          .from('raw_materials')
          .update({ raw_material_quantity: rawMaterialStock + excess })
          .eq('raw_material_id', raw_material_id);
      }

      // Recalculate order_amount
      const newOrderAmount = pricePerUnit * order_quantity;

      // Update the order row
      const { data, error } = await supabase
        .from('orders')
        .update({ order_quantity, order_amount: newOrderAmount })
        .eq('order_id', orderId)
        .eq('vendor_id', vendorId)
        .eq('raw_material_id', raw_material_id)
        .select()
        .single();

      if (error || !data) {
        updatedOrders.push({ raw_material_id, error: 'Order update failed' });
        continue;
      }

      updatedOrders.push({ raw_material_id, order: data, newOrderAmount });
    }

    res.status(200).json({ message: 'Order quantities updated', updatedOrders });
  } catch (err) {
    console.error('Error updating order quantities:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message || err });
  }
};

// // GET /api/vendor/:vendorId/orders - get all orders for a vendor
// exports.getAllOrdersByVendor = async (req, res) => {
//   const { vendorId } = req.params;
//   try {
//     const { data: orders, error } = await supabase
//       .from('orders')
//       .select('*')
//       .eq('vendor_id', vendorId);
//     if (error) {
//       return res.status(500).json({ message: 'Failed to fetch orders', error });
//     }
//     // For each order, fetch raw_material and supplier info
//     const ordersWithDetails = await Promise.all(orders.map(async (order) => {
//       const { raw_material_id } = order;
//       // Get raw material info
//       const { data: material } = await supabase
//         .from('raw_materials')
//         .select('*')
//         .eq('raw_material_id', raw_material_id)
//         .single();
//       // Get supplier info
//       let supplierInfo = null;
//       if (material && material.supplier_id) {
//         const { data: supplier } = await supabase
//           .from('suppliers')
//           .select('*')
//           .eq('supplier_id', material.supplier_id)
//           .single();
//         supplierInfo = supplier;
//       }
//       // Filter raw_material fields
//       const { raw_material_quantity, unit, created_at, rm_pictures, supplier_id, ...materialSafe } = material || {};
//       return {
//         ...order,
//         raw_material: materialSafe,
//         supplier: supplierInfo
//       };
//     }));
//     res.status(200).json({ orders: ordersWithDetails });
//   } catch (err) {
//     console.error('Error fetching vendor orders:', err);
//     res.status(500).json({ message: 'Internal server error', error: err });
//   }
// };

// GET /api/vendor/:vendorId/:orderId - get a single order for a vendor
exports.getOrderByVendor = async (req, res) => {
  const { vendorId, orderId } = req.params;
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('order_id', orderId)
      .single();
    if (error || !order) {
      return res.status(404).json({ message: 'Order not found', error });
    }
    // Get raw material info
    const { data: material } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('raw_material_id', order.raw_material_id)
      .single();
    // Get supplier info
    let supplierInfo = null;
    if (material && material.supplier_id) {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('*')
        .eq('supplier_id', material.supplier_id)
        .single();
      supplierInfo = supplier;
    }
    // Filter raw_material fields
    const { raw_material_quantity, unit, created_at, rm_pictures, supplier_id, ...materialSafe } = material || {};
    res.status(200).json({
      ...order,
      raw_material: materialSafe,
      supplier: supplierInfo
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
};
