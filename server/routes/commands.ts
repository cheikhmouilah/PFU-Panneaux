import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get recent commands
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.*, row_to_json(p.*) as panel
      FROM panel_commands c
      LEFT JOIN panels p ON c.panel_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 20
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create command
router.post('/', authenticateToken, async (req, res) => {
    const { panel_id, command_type, old_code, new_code, status, sent_by, sent_at } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert command
            const commandRes = await client.query(
                `INSERT INTO panel_commands (panel_id, command_type, old_code, new_code, status, sent_by, sent_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
         RETURNING *`,
                [panel_id, command_type, old_code, new_code, status, sent_by, sent_at]
            );

            // Update panel code if command is to change code
            if (command_type === 'change_code' && new_code) {
                await client.query('UPDATE panels SET code = $1 WHERE id = $2', [new_code, panel_id]);
            }

            await client.query('COMMIT');
            res.status(201).json(commandRes.rows[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating command:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
