const pool = require('./config/db');

async function testDB() {
    try {
        console.log("Testing DB connection...");
        await pool.query('SELECT 1');
        console.log("DB connection successful!");
        
        console.log("Checking if users table exists...");
        const [rows] = await pool.query('DESCRIBE users');
        console.log("users table schema:", rows);
        
        console.log("Testing insert query with large decimals...");
        const [result] = await pool.query(
            'INSERT INTO users (role, name, email, password_hash, phone, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['vendor', 'Test Name', 'test_tmp@example.com', 'hash', '+237123', 'address', 4.037728228609083, 9.699678683969431]
        );
        console.log("Insert successful:", result);
        
        await pool.query('DELETE FROM users WHERE email = ?', ['test_tmp@example.com']);
        console.log("Cleaned up test user");
        
    } catch (err) {
        console.error("Test failed with error:", err.message);
        if (err.sqlMessage) console.error("SQL Error Message:", err.sqlMessage);
    } finally {
        process.exit();
    }
}

testDB();
