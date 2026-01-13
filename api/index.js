const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Excavator Maintenance API is running');
});

// Get All Excavators
app.get('/api/excavators', (req, res) => {
    const sql = 'SELECT * FROM excavators';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get Specific Excavator by ID (or QR code data)
app.get('/api/excavators/:id', (req, res) => {
    const sql = 'SELECT * FROM excavators WHERE id = ?';
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Submit Maintenance Log
app.post('/api/maintenance', (req, res) => {
    const { excavator_id, mechanic_name, status, comments } = req.body;
    const sql = 'INSERT INTO maintenance_logs (excavator_id, mechanic_name, status, comments) VALUES (?,?,?,?)';
    const params = [excavator_id, mechanic_name, status, comments];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": this.lastID
        });
    });
});

// Update Excavator Details (Admin)
app.put('/api/excavators/:id', (req, res) => {
    const { name, model } = req.body;
    const sql = 'UPDATE excavators SET name = COALESCE(?, name), model = COALESCE(?, model) WHERE id = ?';
    const params = [name, model, req.params.id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});

// Get History
app.get('/api/history', (req, res) => {
    const sql = `
        SELECT logs.*, exc.name as excavator_name 
        FROM maintenance_logs logs
        JOIN excavators exc ON logs.excavator_id = exc.id
        ORDER BY date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Seeding for testing
app.get('/api/seed', (req, res) => {
    const insert = 'INSERT INTO excavators (name, model, qr_code_data) VALUES (?,?,?)';
    db.run(insert, ["Excavator 01", "CAT-320", "EXC-001"]);
    db.run(insert, ["Excavator 02", "Doosan-DX140", "EXC-002"]);
    res.json({ "message": "Database seeded" });
});

// For Vercel, we export the app. For local, we listen.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

