import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all panels
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching panels for user:', (req as any).user);
        const result = await pool.query(`
      SELECT *, 
             ST_AsGeoJSON(location)::json as location 
      FROM panels
      ORDER BY created_at DESC
    `);
        console.log(`Found ${result.rows.length} panels.`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching panels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET Public panel state (for simulation display)
router.get('/public/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, code, category FROM panels WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Panel not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching public panel state:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List images per category
router.get('/images-list/:category', authenticateToken, async (req, res) => {
    const { category } = req.params;
    const categoryMap: Record<string, string> = {
        'A': 'Danger',
        'B': 'Priorité',
        'C': 'Prescription',
        'D': 'Indication'
    };

    const folderName = categoryMap[category];
    if (!folderName) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const imagesPath = path.join(__dirname, '../../public/images', folderName);
        if (!fs.existsSync(imagesPath)) {
            return res.json([]);
        }
        const files = fs.readdirSync(imagesPath);
        const images = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg'));
        res.json(images);
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create panel
router.post('/', authenticateToken, async (req, res) => {
    const { code, category, location, address, status } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO panels (code, category, location, address, status, created_at) 
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4, $5, NOW()) 
       RETURNING *, ST_AsGeoJSON(location)::json as location`,
            [code, category, JSON.stringify(location), address, status || 'fonctionnel']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating panel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update panel
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { code, category, location, address, status } = req.body;

    try {
        let query = 'UPDATE panels SET updated_at = NOW()';
        const params = [id];
        let paramCount = 1;

        if (code) {
            paramCount++;
            query += `, code = $${paramCount}`;
            params.push(code);
        }
        if (category) {
            paramCount++;
            query += `, category = $${paramCount}`;
            params.push(category);
        }
        if (location) {
            paramCount++;
            query += `, location = ST_SetSRID(ST_GeomFromGeoJSON($${paramCount}), 4326)`;
            params.push(JSON.stringify(location));
        }
        if (address) {
            paramCount++;
            query += `, address = $${paramCount}`;
            params.push(address);
        }
        if (status) {
            paramCount++;
            query += `, status = $${paramCount}`;
            params.push(status);
        }

        query += ` WHERE id = $1 RETURNING *, ST_AsGeoJSON(location)::json as location`;

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Panel not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating panel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete panel
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM panels WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Panel not found' });
        }

        res.json({ message: 'Panel deleted' });
    } catch (error) {
        console.error('Error deleting panel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
