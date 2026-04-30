import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all interventions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT i.*, 
             row_to_json(p.*) as panel,
             row_to_json(t.*) as technician
      FROM interventions i
      LEFT JOIN panels p ON i.panel_id = p.id
      LEFT JOIN technicians t ON i.technician_id = t.id
      ORDER BY i.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching interventions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create intervention
router.post('/', authenticateToken, async (req, res) => {
    const { panel_id, technician_id, type, priority, description, scheduled_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO interventions (panel_id, technician_id, type, priority, description, scheduled_date, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'planifiee', NOW()) 
       RETURNING *`,
            [panel_id, technician_id, type, priority, description, scheduled_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating intervention:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update intervention
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { technician_id, status, start_date, end_date, notes } = req.body;

    try {
        const result = await pool.query(
            `UPDATE interventions 
       SET technician_id = COALESCE($1, technician_id),
           status = COALESCE($2, status),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           notes = COALESCE($5, notes),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
            [technician_id, status, start_date, end_date, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Intervention not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating intervention:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
