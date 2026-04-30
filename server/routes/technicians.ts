import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get available profiles for technician creation (role 'technicien' AND not yet a technician)
router.get('/available-profiles', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.* 
            FROM profiles p
            WHERE p.role = 'technicien'
            AND NOT EXISTS (
                SELECT 1 FROM technicians t WHERE t.profile_id = p.id
            )
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching available profiles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all technicians
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT t.*, row_to_json(p.*) as profile 
      FROM technicians t
      LEFT JOIN profiles p ON t.profile_id = p.id
      ORDER BY t.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching technicians:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create technician
router.post('/', authenticateToken, async (req, res) => {
    const { profile_id, specialization, phone, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO technicians (profile_id, specialization, phone, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [profile_id, specialization, phone, status || 'disponible']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating technician:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update technician
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { specialization, phone, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE technicians 
       SET specialization = COALESCE($1, specialization), 
           phone = COALESCE($2, phone), 
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
            [specialization, phone, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Technician not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating technician:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete technician
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM technicians WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Technician not found' });
        }

        res.json({ message: 'Technician deleted' });
    } catch (error) {
        console.error('Error deleting technician:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
