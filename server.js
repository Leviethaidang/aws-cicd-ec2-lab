const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 80; 

const db = mysql.createPool({
    host: 'database-6722.c5mwgwqs805f.ap-southeast-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Letmein123!!!',
    database: 'appdb',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', (req, res) => {
    db.query('SELECT name AS display_data FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ version: "V1 (Name)", data: results });
    });
});

app.listen(port, () => console.log(`App running on port ${port}`));