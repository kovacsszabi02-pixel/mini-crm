const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

console.log("--> FIGYELEM: EZ A FRISSITETT SERVER.JS FUT (DUE_DATE FIX-SZEL)!");

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
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, manager, accepted_offer, website } = req.body;

        const newPartner = await pool.query(
            `INSERT INTO partners 
            (company_name, contact_person, phone, email, revenue, tax_number, billing_address, status, manager, accepted_offer, website) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
              company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', '1. Új lead', manager || '', accepted_offer || '', website || ''
            ]
        );
        res.json(newPartner.rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Partner adatainak szerkesztése
app.put('/api/partners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, status, manager, accepted_offer, website } = req.body;

        const updatedPartner = await pool.query(
            `UPDATE partners 
             SET company_name = $1, contact_person = $2, phone = $3, email = $4, revenue = $5, tax_number = $6, billing_address = $7, status = $8, manager = $9, accepted_offer = $10, website = $11
             WHERE id = $12 RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', status, manager || '', accepted_offer || '', website || '', id]
        );

        if (updatedPartner.rows.length === 0) return res.status(404).json({ error: 'A partner nem található.' });
        res.json(updatedPartner.rows[0]);
    } catch (err) {
        console.error('Hiba a partner szerkesztésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. Státusz frissítése
app.put('/api/partners/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const oldPartnerRes = await pool.query('SELECT status FROM partners WHERE id = $1', [id]);
        const oldStatus = oldPartnerRes.rows[0] ? oldPartnerRes.rows[0].status : '';

        const updatedPartner = await pool.query('UPDATE partners SET status = $1 WHERE id = $2 RETURNING *', [status, id]);

        const logNote = note && note.trim() !== '' ? `Státusz módosítva: ${oldStatus} -> ${status}. Megjegyzés: ${note}` : `Státusz módosítva: ${oldStatus} -> ${status}`;
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)', [id, 'Admin', 'STÁTUSZVÁLTÁS', oldStatus, status, logNote]);

        res.json(updatedPartner.rows[0]);
    } catch (err) {
        console.error('Hiba státusz frissítésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Feladatok kezelése (GET, POST, PUT)
app.get('/api/partners/:id/tasks', async (req, res) => {
    try {
        const tasks = await pool.query('SELECT * FROM tasks WHERE partner_id = $1 ORDER BY id ASC', [req.params.id]);
        res.json(tasks.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/tasks', async (req, res) => {
    try {
        const { description, due_date } = req.body;
        const newTask = await pool.query(
            'INSERT INTO tasks (partner_id, description, due_date) VALUES ($1, $2, $3) RETURNING *', 
            [req.params.id, description, due_date || null]
        );
        
        const dateNote = due_date ? ` (Határidő: ${due_date})` : '';
        await pool.query(
            'INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', 
            [req.params.id, 'Admin', 'ÚJ FELADAT', `Kiosztott feladat: ${description}${dateNote}`]
        );
        res.json(newTask.rows[0]);
    } catch (err) { 
        console.error('Hiba feladat mentésekor:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

app.put('/api/partners/:partnerId/tasks/:taskId/complete', async (req, res) => {
    try {
        const updatedTask = await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *', [req.params.taskId]);
        if (updatedTask.rows.length > 0) {
            await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.partnerId, 'Admin', 'FELADAT KÉSZ', `Feladat lezárva: ${updatedTask.rows[0].description}`]);
        }
        res.json(updatedTask.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Dokumentumok kezelése (GET, POST, DELETE)
app.get('/api/partners/:id/documents', async (req, res) => {
    try {
        const docs = await pool.query('SELECT * FROM documents WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json(docs.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/documents', async (req, res) => {
    try {
        const { doc_type, doc_name, doc_url } = req.body;
        const newDoc = await pool.query(
            'INSERT INTO documents (partner_id, doc_type, doc_name, doc_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.params.id, doc_type, doc_name, doc_url]
        );
        const typeName = doc_type === 'offer' ? 'Ajánlat' : 'Szerződés/Számla';
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Admin', 'ÚJ DOKUMENTUM', `${typeName} csatolva: ${doc_name}`]);
        res.json(newDoc.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/partners/:partnerId/documents/:docId', async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [req.params.docId]);
        res.json({ message: 'Dokumentum törölve.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Logok kezelése
app.get('/api/partners/:id/logs', async (req, res) => {
    try {
        const logs = await pool.query('SELECT * FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json(logs.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/logs', async (req, res) => {
    try {
        const newLog = await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, 'Admin', 'MEGJEGYZÉS', req.body.note]);
        res.json(newLog.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Partner törlése
app.delete('/api/partners/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE partner_id = $1', [req.params.id]);
        await pool.query('DELETE FROM tasks WHERE partner_id = $1', [req.params.id]);
        await pool.query('DELETE FROM partners WHERE id = $1', [req.params.id]);
        res.json({ message: 'Partner és a hozzá tartozó adatok törölve.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`A szerver stabilan fut a http://localhost:${PORT} címen.`));

setInterval(() => {}, 1000000);

// Adatbázis sémák és hiányzó oszlopok biztosítása
pool.query(`
  CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    status TEXT
  );

  ALTER TABLE partners ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS revenue TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS tax_number TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS billing_address TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS manager TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS accepted_offer TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;
  
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    partner_id INT,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TEXT;

  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    partner_id INT,
    doc_type TEXT,
    doc_name TEXT,
    doc_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    partner_id INT,
    user_name TEXT,
    action_type TEXT,
    old_status TEXT,
    new_status TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log("✔ Adatbázis sémák sikeresen frissítve.")).catch(err => console.error("❌ Hiba az adatbázis sémák frissítésekor:", err));