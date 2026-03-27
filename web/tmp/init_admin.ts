
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://uufmfjhbwqkoqotyqhfs.supabase.co'
// const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Zm1mamhid3Frb3FvdHlxaGZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkxOTc1NywiZXhwIjoyMDg3NDk1NzU3fQ.dlcMi7VTiMImUGy0AChbfc5e7U9H5qJIxuUHk4rVD68'

// const supabase = createClient(supabaseUrl, serviceRoleKey)

// async function initAdmin() {
//   console.log('Creating super_admin account...')
  
//   const { data, error } = await supabase.auth.admin.createUser({
//     email: 'bhishamthakur012@gmail.com',
//     password: 'admin4321',
//     email_confirm: true,
//     user_metadata: {
//       role_id: 1,
//       full_name: 'Bhisham Thakur'
//     }
//   })

//   if (error) {
//     if (error.message.includes('already exists')) {
//       console.log('User already exists in Auth.')
//     } else {
//       console.error('Error creating user:', error.message)
//       return
//     }
//   } else {
//     console.log('User created successfully:', data.user?.id)
//   }

//   // Ensure user is in public.users and public.admins if trigger didn't catch it
//   // (The trigger should have caught it, but we can verify)
//   const userId = data.user?.id || (await supabase.from('users').select('id').eq('email', 'bhishamthakur012@gmail.com').single()).data?.id

//   if (userId) {
//     console.log('Ensuring admin profile for:', userId)
//     const { error: adminError } = await supabase.from('admins').upsert({
//       user_id: userId,
//       name: 'Bhisham Thakur',
//       email: 'bhishamthakur012@gmail.com',
//       role: 'super_admin',
//       status: 'active'
//     })
//     if (adminError) console.error('Admin profile error:', adminError.message)
//     else console.log('Admin profile ensured.')
//   }
// }

// initAdmin()
