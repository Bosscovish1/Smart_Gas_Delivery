const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Get products for a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE vendor_id = ?', [req.params.vendorId]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// Add a new product (vendor only)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can add products' });
    }

    const { gas_brand, bottle_size, price, stock_quantity } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO products (vendor_id, gas_brand, bottle_size, price, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, gas_brand, bottle_size, price, stock_quantity || 0]
        );
        res.status(201).json({ message: 'Product added', productId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error adding product' });
    }
});

// Update stock (vendor only)
router.put('/:id', protect, async (req, res) => {
     if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can update products' });
    }

    const { price, stock_quantity } = req.body;

    try {
        await pool.query(
            'UPDATE products SET price = ?, stock_quantity = ? WHERE id = ? AND vendor_id = ?',
            [price, stock_quantity, req.params.id, req.user.id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating product' });
    }
});

module.exports = router;
