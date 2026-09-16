const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Tesztelő log, hogy lássuk, ez a frissített fájl fut-e
console.log("--> FIGYELEM: EZ A FRISSITETT SERVER.JS FUT!");

process.on('uncaughtException', (err) => {
    console.error('KIVÉTELES HIBA:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('NEM KEZELT PROMISE HIBA:', reason);
});

// 1. Partnerek lekérdezése
app.get('/api/partners', async (req, res) => {
    try {
        const allPartners = await pool.query('SELECT * FROM partners ORDER BY id DESC');
        res.json(allPartners.rows);
    } catch (err) {
        console.error('Hiba partnerek lekérésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. Új partner hozzáadása
app.post('/api/partners', async (req, res) => {
    try {
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address } = req.body;

        const newPartner = await pool.query(
            `INSERT INTO partners 
            (company_name, contact_person, phone, email, revenue, tax_number, billing_address, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
              company_name, 
              contact_person, 
              phone, 
              email || '', 
              revenue || '', 
              tax_number || '', 
              billing_address || '', 
              '1. Új lead'
            ]
        );
        res.json(newPartner.rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Státusz frissítése
app.put('/api/partners/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const oldPartnerRes = await pool.query('SELECT status FROM partners WHERE id = $1', [id]);
        const oldStatus = oldPartnerRes.rows[0] ? oldPartnerRes.rows[0].status : '';

        const updatedPartner = await pool.query(
            'UPDATE partners SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        const logNote = note && note.trim() !== '' 
            ? `Státusz módosítva: ${oldStatus} -> ${status}. Megjegyzés: ${note}` 
            : `Státusz módosítva: ${oldStatus} -> ${status}`;

        await pool.query(
            'INSERT INTO audit_logs (partner_id, user_name, action_type, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, 'Admin', 'STÁTUSZVÁLTÁS', oldStatus, status, logNote]
        );

        res.json(updatedPartner.rows[0]);
    } catch (err) {
        console.error('Hiba státusz frissítésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. Logok lekérdezése
app.get('/api/partners/:id/logs', async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await pool.query('SELECT * FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC', [id]);
        res.json(logs.rows);
    } catch (err) {
        console.error('Hiba logok lekérésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Megjegyzés rögzítése
app.post('/api/partners/:id/logs', async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        
        const newLog = await pool.query(
            'INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, 'Admin', 'MEGJEGYZÉS', note]
        );
        
        res.json(newLog.rows[0]);
    } catch (err) {
        console.error('Hiba megjegyzés mentésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. Partner törlése
app.delete('/api/partners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM partners WHERE id = $1', [id]);
        res.json({ message: 'Partner és a hozzá tartozó logok törölve.' });
    } catch (err) {
        console.error('Hiba a törléskor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`A szerver stabilan fut a http://localhost:${PORT} címen.`);
});

setInterval(() => {}, 1000000);