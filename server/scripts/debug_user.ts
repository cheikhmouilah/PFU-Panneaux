import { pool } from '../db.js';

async function checkUser() {
    try {
        const res = await pool.query(`
      SELECT u.email, p.role, p.full_name 
      FROM users u 
      JOIN profiles p ON u.profile_id = p.id 
      WHERE u.email = 'cmouilah@gmail.com'
    `);
        console.log('User Role Check:', JSON.stringify(res.rows[0], null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkUser();
