import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

import authRoutes from './routes/auth.js';
import technicianRoutes from './routes/technicians.js';
import panelRoutes from './routes/panels.js';
import interventionRoutes from './routes/interventions.js';
import dashboardRoutes from './routes/dashboard.js';
import commandRoutes from './routes/commands.js';

app.use('/api/auth', authRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/commands', commandRoutes);

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
