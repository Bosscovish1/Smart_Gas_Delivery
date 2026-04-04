const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { adminProtect } = require('../middleware/authMiddleware');

// Get overview stats
router.get('/stats', adminProtect, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [orders] = await pool.query('SELECT COUNT(*) as count, SUM(total_price) as revenue FROM orders');
        
        res.json({
            total_users: users[0].count,
            total_orders: orders[0].count,
            total_revenue: orders[0].revenue || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Get all users
router.get('/users', adminProtect, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Delete user
router.delete('/users/:id', adminProtect, async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get all orders globally
router.get('/orders', adminProtect, async (req, res) => {
    try {
        const query = `
            SELECT o.*, 
                   c.name as customer_name, c.phone as customer_phone,
                   v.name as vendor_name,
                   p.gas_brand, p.bottle_size
            FROM orders o
            JOIN users c ON o.customer_id = c.id
            JOIN users v ON o.vendor_id = v.id
            JOIN products p ON o.product_id = p.id
            ORDER BY o.created_at DESC
        `;
        const [orders] = await pool.query(query);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching global orders' });
    }
});

module.exports = router;
