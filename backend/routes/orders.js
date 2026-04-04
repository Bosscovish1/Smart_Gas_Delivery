const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Create an order (customer only)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can place orders' });
    }

    const { vendor_id, product_id, quantity, total_price, payment_method } = req.body;
    const method = payment_method === 'mobile_money' ? 'mobile_money' : 'cash';

    try {
        const [result] = await pool.query(
            'INSERT INTO orders (customer_id, vendor_id, product_id, quantity, total_price, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, vendor_id, product_id, quantity, total_price, method, 'pending']
        );
        res.status(201).json({ message: 'Order placed successfully', orderId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error placing order' });
    }
});

// Get orders for logged in user (customer or vendor)
router.get('/', protect, async (req, res) => {
    try {
        let query = '';
        let params = [];
        
        if (req.user.role === 'customer') {
            query = `
                SELECT o.*, p.gas_brand, p.bottle_size, u.name as vendor_name 
                FROM orders o
                JOIN products p ON o.product_id = p.id
                JOIN users u ON o.vendor_id = u.id
                WHERE o.customer_id = ?
                ORDER BY o.created_at DESC
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT o.*, p.gas_brand, p.bottle_size, u.name as customer_name, u.phone as customer_phone, u.address as customer_address
                FROM orders o
                JOIN products p ON o.product_id = p.id
                JOIN users u ON o.customer_id = u.id
                WHERE o.vendor_id = ?
                ORDER BY o.created_at DESC
            `;
            params = [req.user.id];
        }

        const [orders] = await pool.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// Update order status (vendor only)
router.put('/:id/status', protect, async (req, res) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can update order status' });
    }

    const { status } = req.body;
    
    try {
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ? AND vendor_id = ?',
            [status, req.params.id, req.user.id]
        );
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating order' });
    }
});

module.exports = router;
