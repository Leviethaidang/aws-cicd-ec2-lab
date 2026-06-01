const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 80;

// Cấu hình Connection Pool kết nối tới RDS (Lát nữa tạo RDS xong ta sẽ điền Endpoint vào đây)
const db = mysql.createPool({
    host: 'appdb.c5mwgwqs805f.ap-southeast-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Letmein123!!!',
    database: 'appdb',
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