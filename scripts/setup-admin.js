require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createAdmin() {
  const email = 'akure1612@gmail.com';
  const password = 'AkureAdmin123!';

  console.log('🌿 Setting up admin account...');
  
  // Try to create the user
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'AKURE Admin' }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      console.log(`[INFO] Email ${email} is already registered. Updating password...`);
      
      // Get the existing user ID
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData.users.find(u => u.email === email);
      
      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: password,
          app_metadata: { role: 'admin' }
        });
        
        if (updateError) {
          console.error('❌ Failed to update password:', updateError.message);
        } else {
          console.log(`✅ Admin account updated!`);
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
        }
      } else {
        console.error('❌ User exists but could not be located in list.');
      }
    } else {
      console.error('❌ Failed to create admin user:', error.message);
    }
  } else {
    console.log(`✅ Admin account created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  }
}

createAdmin();
