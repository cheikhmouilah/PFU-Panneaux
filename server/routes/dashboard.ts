import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const [
            panelsRes,
            functionalRes,
            maintenanceRes,
            outOfServiceRes,
            intelligentRes,
            interventionsRes,
            pendingRes,
            inProgressRes,
            completedRes,
            techniciansRes,
            availableTechRes
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM panels'),
            pool.query("SELECT COUNT(*) FROM panels WHERE status = 'fonctionnel'"),
            pool.query("SELECT COUNT(*) FROM panels WHERE status = 'en_maintenance'"),
            pool.query("SELECT COUNT(*) FROM panels WHERE status = 'hors_service'"),
            pool.query("SELECT COUNT(*) FROM panels WHERE is_intelligent = true"),
            pool.query('SELECT COUNT(*) FROM interventions'),
            pool.query("SELECT COUNT(*) FROM interventions WHERE status = 'planifiee'"),
            pool.query("SELECT COUNT(*) FROM interventions WHERE status = 'en_cours'"),
            pool.query("SELECT COUNT(*) FROM interventions WHERE status = 'terminee'"),
            pool.query('SELECT COUNT(*) FROM technicians'),
            pool.query("SELECT COUNT(*) FROM technicians WHERE status = 'disponible'")
        ]);

        const stats = {
            totalPanels: parseInt(panelsRes.rows[0].count),
            functionalPanels: parseInt(functionalRes.rows[0].count),
            maintenancePanels: parseInt(maintenanceRes.rows[0].count),
            outOfServicePanels: parseInt(outOfServiceRes.rows[0].count),
            intelligentPanels: parseInt(intelligentRes.rows[0].count),
            totalInterventions: parseInt(interventionsRes.rows[0].count),
            pendingInterventions: parseInt(pendingRes.rows[0].count),
            inProgressInterventions: parseInt(inProgressRes.rows[0].count),
            completedInterventions: parseInt(completedRes.rows[0].count),
            totalTechnicians: parseInt(techniciansRes.rows[0].count),
            availableTechnicians: parseInt(availableTechRes.rows[0].count),
        };

        console.log('Dashboard stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
