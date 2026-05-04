
const { createClient } = require('@supabase/supabase-js');

async function resetPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const userId = 'dd42c678-83b3-461e-a4db-13caf8c11fa9';
  const newPassword = 'jainam419';

  console.log('Resetting password for user:', userId);
  
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    console.error('Error resetting password:', error);
  } else {
    console.log('Password reset successfully for:', data.user.email);
  }
}

resetPassword();
