const pool = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


exports.createUser = async (req, res) => {
  const { display_name, phone_number, email, role, work, password } = req.body;

  if (!display_name || !phone_number || !email || !role || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Create user in Supabase Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: {
    display_name,
    role,
    phone_number  // ✅ Now included in metadata
  }
});

    const user_id = user.user.id;

    console.log('User created in Supabase:', user);

    // 2. Insert into vendor or supplier table based on role
    if (role === 'VENDOR') {
      await pool.query(
        `INSERT INTO vendor (vendor_id, vendor_name, phone_number, email, work)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, display_name, phone_number, email, work]
      );
    } else if (role === 'SUPPLIER') {
      await pool.query(
        `INSERT INTO suppliers (supplier_id, supplier_name, phone_number, email, work)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, display_name, phone_number, email, work]
      );
    }

    return res.status(201).json({ message: 'User created successfully', user_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
