const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 80;

// Cấu hình Connection Pool kết nối tới RDS
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // co bien DB_HOST thi lay, khong thi la localhost
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Letmein123!!!',
    database: process.env.DB_NAME || 'appdb',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.static(path.join(__dirname, 'public')));

//safe
app.get('/api/users', (req, res) => {
    db.query('SELECT name, phone AS display_data FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ version: "1", data: results });
    });
});

//unsafe
app.get('/api/users/address', (req, res) => {
    db.query('SELECT name, phone AS display_data, address AS display_address FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ version: "2", data: results });
    });
});

app.listen(port, () => console.log(`App running on port ${port}`));