const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get nearby vendors
router.get('/nearby', async (req, res) => {
    const { lat, lng, radius = 10 } = req.query; // radius in km

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    try {
        const query = `
            SELECT id, name, email, phone, address, lat, lng,
            ( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(?) ) + sin( radians(?) ) * sin( radians( lat ) ) ) ) AS distance
            FROM users
            WHERE role = 'vendor' AND lat IS NOT NULL AND lng IS NOT NULL
            HAVING distance < ?
            ORDER BY distance
        `;
        const [vendors] = await pool.query(query, [lat, lng, lat, radius]);
        res.json(vendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching vendors' });
    }
});

module.exports = router;
