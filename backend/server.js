const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Smart Domestic Gas Delivery API is running...' });
});

// Routes placeholders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
