const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.createUser = async (req, res) => {
  const { display_name, phone_number, email, role, work, password } = req.body;

  // ✅ Check for required fields
  if (!display_name || !phone_number || !email || !role || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // ✅ Create user in Supabase Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        display_name,
        role,
        phone_number
      }
    });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(400).json({ message: 'Supabase user creation failed', error: error.message });
    }

    if (!user || !user.user || !user.user.id) {
      return res.status(500).json({ message: 'Supabase did not return a valid user object' });
    }

    const user_id = user.user.id;

    try {
      // ✅ Insert into the appropriate table using Supabase
      let data, error;
      
      if (role === 'VENDOR') {
        ({ data, error } = await supabase
          .from('vendor')
          .insert([
            {
              vendor_id: user_id,
              vendor_name: display_name,
              phone_number,
              email,
              work
            }
          ]));
      } else if (role === 'SUPPLIER') {
        ({ data, error } = await supabase
          .from('suppliers')
          .insert([
            {
              supplier_id: user_id,
              supplier_name: display_name,
              phone_number,
              email,
              work
            }
          ]));
      } else {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      if (error) {
        console.error('❌ Supabase insertion error:', error);
        return res.status(500).json({
          message: 'Failed to insert user details in database',
          error: error.message
        });
      }

      return res.status(201).json({ 
        message: 'User created successfully', 
        user_id,
        user: {
          display_name,
          role,
        }
      });
    } catch (err) {
      console.error('❌ Unexpected server error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  } catch (err) {
    console.error('❌ Unexpected server error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
