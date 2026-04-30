import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists. We assume a 'users' table or fields in 'profiles'
        // For this migration, we'll try to find a user in the 'users' table which links to 'profiles'
        // OR we might just add email/password to 'profiles' for simplicity if 'users' doesn't exist yet.
        // Let's assume a strictly standard approach: 'users' table with email, password_hash, profile_id.

        // Join with profiles to get the role and full name
        const userResult = await pool.query(`
            SELECT u.*, p.role, p.full_name as profile_full_name
            FROM users u
            JOIN profiles p ON u.profile_id = p.id
            WHERE u.email = $1
        `, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.profile_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email },
            profile: {
                id: user.profile_id,
                full_name: user.profile_full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create profile first (or user first if profile depends on user)
            // Supabase does User -> Profile.
            // Let's create a Profile ID (UUID)
            const profileIdResult = await client.query('SELECT gen_random_uuid()');
            const profileId = profileIdResult.rows[0].gen_random_uuid;

            // Insert into profiles
            await client.query(
                'INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, $3)',
                [profileId, fullName, 'observateur']
            );

            // Insert into users
            await client.query(
                'INSERT INTO users (email, password_hash, profile_id) VALUES ($1, $2, $3)',
                [email, hashedPassword, profileId]
            );

            await client.query('COMMIT');

            res.status(201).json({ message: 'User created successfully' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

import { authenticateToken } from '../middleware/auth.js';

router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const profileResult = await pool.query(`
            SELECT p.*, u.email
            FROM profiles p
            JOIN users u ON p.id = u.profile_id
            WHERE p.id = $1
        `, [req.user.id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profileResult.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
