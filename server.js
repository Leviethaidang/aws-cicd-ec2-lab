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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function validateUserPayload(req, res, next) {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
        return res.status(400).json({
            error: 'Please fill in all fields: name, phone, and address'    
        });
    }

    req.userPayload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
    };

    next();
}

app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, phone AS display_data FROM users ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ version: "1", data: results });
    });
});

app.get('/api/users/address', (req, res) => {
    db.query('SELECT id, name, phone AS display_data, address AS display_address FROM users ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ version: "2", data: results });
    });
});

app.post('/api/users', validateUserPayload, (req, res) => {
    const { name, phone, address } = req.userPayload;

    db.query(
        'INSERT INTO users (name, phone, address) VALUES (?, ?, ?)',
        [name, phone, address],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: 'User added successfully',
                data: { id: result.insertId, name, phone, address }
            });
        }
    );
});

app.put('/api/users/:id', validateUserPayload, (req, res) => {
    const { name, phone, address } = req.userPayload;
    const { id } = req.params;

    db.query(
        'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
        [name, phone, address, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Not found' });
            }

            res.json({
                message: 'User updated successfully ',
                data: { id: Number(id), name, phone, address }
            });
        }
    );
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        res.json({ message: 'Deleted successfully' });
    });
});

app.listen(port, () => console.log(`App running on port ${port}`));
