const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

console.log("--> FIGYELEM: EZ A JAVITOTT, FETCH ALAPU SERVER.JS FUT!");

process.on('uncaughtException', (err) => console.error('KIVÉTELES HIBA:', err));
process.on('unhandledRejection', (reason, promise) => console.error('NEM KEZELT PROMISE HIBA:', reason));

// ==========================================
// KÖZVETLEN GOOGLE SHEETS SZINKRONIZÁCIÓ (FETCH)
// ==========================================
const SHEETS_WEBHOOK_URL = 'httpshttps://script.google.com/macros/s/AKfycbwLeupg5VsC2PnFe3hTQHcaVzbuB3J3WQv6CmMOzACJ-whIVCu728-mGkZx4Idnaqjf/exec'; 

async function syncToSheets(partnerData, action) {
    if (!SHEETS_WEBHOOK_URL) return;
    try {
        const response = await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 
                'Content-Type': 'text/plain;charset=utf-8' 
            },
            body: JSON.stringify({ action, partner: partnerData })
        });
        
        const resultText = await response.text();
        console.log(`[Google Sheets Sync] Státusz: ${response.status} | Válasz: ${resultText} | Cég: ${partnerData.company_name}`);
    } catch (err) {
        console.error('[Google Sheets Sync Hiba]:', err.message);
    }
}

// 1. Lekérdezés
app.get('/api/partners', async (req, res) => {
    try {
        const allPartners = await pool.query('SELECT * FROM partners ORDER BY id DESC');
        res.json(allPartners.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Új partner
app.post('/api/partners', async (req, res) => {
    try {
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, manager, accepted_offer, chosen_package, addons, website } = req.body;
        const newPartner = await pool.query(
            `INSERT INTO partners (company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, status, manager, accepted_offer, chosen_package, addons, website) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', headquarters || '', '1. Új lead', manager || '', accepted_offer || '', chosen_package || '', addons || '', website || '']
        );
        syncToSheets(newPartner.rows[0], 'CREATE');
        res.json(newPartner.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Szerkesztés
app.put('/api/partners/:id', async (req, res) => {
    try {
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, status, manager, accepted_offer, chosen_package, addons, website } = req.body;
        const updatedPartner = await pool.query(
            `UPDATE partners SET company_name = $1, contact_person = $2, phone = $3, email = $4, revenue = $5, tax_number = $6, billing_address = $7, headquarters = $8, status = $9, manager = $10, accepted_offer = $11, chosen_package = $12, addons = $13, website = $14
             WHERE id = $15 RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', headquarters || '', status, manager || '', accepted_offer || '', chosen_package || '', addons || '', website || '', req.params.id]
        );
        if (updatedPartner.rows.length === 0) return res.status(404).json({ error: 'Nincs partner.' });
        syncToSheets(updatedPartner.rows[0], 'UPDATE');
        res.json(updatedPartner.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Státusz frissítése
app.put('/api/partners/:id/status', async (req, res) => {
    try {
        const { status, note } = req.body;
        const oldRes = await pool.query('SELECT status FROM partners WHERE id = $1', [req.params.id]);
        const oldStatus = oldRes.rows[0] ? oldRes.rows[0].status : '';
        const updatedPartner = await pool.query('UPDATE partners SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
        
        const logNote = note && note.trim() !== '' ? `${oldStatus} ➔ ${status} | Megjegyzés: ${note}` : `${oldStatus} ➔ ${status}`;
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)', [req.params.id, 'Admin', 'STÁTUSZVÁLTÁS', oldStatus, status, logNote]);
        
        syncToSheets(updatedPartner.rows[0], 'STATUS_UPDATE');
        res.json(updatedPartner.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Feladatok
app.get('/api/tasks/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tasks = await pool.query(`SELECT t.*, p.company_name FROM tasks t JOIN partners p ON t.partner_id = p.id WHERE t.due_date <= $1 AND t.is_completed = false ORDER BY t.due_date ASC, t.id ASC`, [today]);
        res.json(tasks.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/partners/:id/tasks', async (req, res) => {
    try {
        const tasks = await pool.query('SELECT * FROM tasks WHERE partner_id = $1 ORDER BY id ASC', [req.params.id]);
        const today = new Date().toISOString().split('T')[0];
        for (let task of tasks.rows) {
            if (!task.is_completed && task.due_date && task.due_date < today && !task.flagged_overdue) {
                await pool.query('UPDATE tasks SET flagged_overdue = true WHERE id = $1', [task.id]);
                await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Rendszer', 'LEJÁRT FELADAT', `${task.description} (${task.due_date})`]);
                task.flagged_overdue = true;
            }
        }
        res.json(tasks.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/tasks', async (req, res) => {
    try {
        const newTask = await pool.query('INSERT INTO tasks (partner_id, description, due_date) VALUES ($1, $2, $3) RETURNING *', [req.params.id, req.body.description, req.body.due_date || null]);
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Admin', 'ÚJ FELADAT', `${req.body.description} ${req.body.due_date ? `(${req.body.due_date})` : ''}`]);
        res.json(newTask.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:partnerId/tasks/:taskId/complete', async (req, res) => {
    try {
        const updatedTask = await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *', [req.params.taskId]);
        if (updatedTask.rows.length > 0) await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.partnerId, 'Admin', 'FELADAT KÉSZ', `Elvégezve: ${updatedTask.rows[0].description}`]);
        res.json(updatedTask.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Dokumentumok
app.get('/api/partners/:id/documents', async (req, res) => {
    try {
        const docs = await pool.query('SELECT * FROM documents WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json(docs.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/documents', async (req, res) => {
    try {
        const { doc_type, doc_name, doc_url } = req.body;
        const newDoc = await pool.query('INSERT INTO documents (partner_id, doc_type, doc_name, doc_url) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, doc_type, doc_name, doc_url]);
        
        let typeName = 'Dokumentum';
        if (doc_type === 'offer') typeName = 'Ajánlat';
        if (doc_type === 'contract') typeName = 'Szerződés';
        if (doc_type === 'playbook') typeName = 'Playbook';

        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Admin', 'ÚJ DOKUMENTUM', `${typeName} csatolva: ${doc_name}`]);
        res.json(newDoc.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/partners/:partnerId/documents/:docId', async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [req.params.docId]);
        res.json({ message: 'Törölve.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. E-mail sablonok
app.get('/api/email-templates', async (req, res) => {
    try {
        const templates = await pool.query('SELECT * FROM email_templates ORDER BY id ASC');
        res.json(templates.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/email-templates', async (req, res) => {
    try {
        const newTpl = await pool.query('INSERT INTO email_templates (title, subject, body) VALUES ($1, $2, $3) RETURNING *', [req.body.title, req.body.subject, req.body.body]);
        res.json(newTpl.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/email-templates/:id', async (req, res) => {
    try {
        const updated = await pool.query('UPDATE email_templates SET title = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *', [req.body.title, req.body.subject, req.body.body, req.params.id]);
        res.json(updated.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/email-templates/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM email_templates WHERE id = $1', [req.params.id]);
        res.json({ message: 'Törölve.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Logok és Törlés
app.get('/api/partners/:id/logs', async (req, res) => {
    try {
        const logs = await pool.query('SELECT * FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json(logs.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/partners/:id/logs', async (req, res) => {
    try {
        const newLog = await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, 'Admin', req.body.action_type || 'MEGJEGYZÉS', req.body.note]);
        res.json(newLog.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/partners/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE partner_id = $1', [req.params.id]);
        await pool.query('DELETE FROM tasks WHERE partner_id = $1', [req.params.id]);
        await pool.query('DELETE FROM partners WHERE id = $1', [req.params.id]);
        res.json({ message: 'Partner törölve.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`A szerver stabilan fut a http://localhost:${PORT} címen.`));

// Adatbázis sémák
pool.query(`
  CREATE TABLE IF NOT EXISTS partners (id SERIAL PRIMARY KEY, company_name TEXT NOT NULL, contact_person TEXT, phone TEXT, status TEXT);
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS revenue TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS tax_number TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS billing_address TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS headquarters TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS manager TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS accepted_offer TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS chosen_package TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS addons TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;
  
  CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, partner_id INT, description TEXT NOT NULL, is_completed BOOLEAN DEFAULT false, due_date TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TEXT;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS flagged_overdue BOOLEAN DEFAULT false;

  CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, partner_id INT, doc_type TEXT, doc_name TEXT, doc_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, partner_id INT, user_name TEXT, action_type TEXT, old_status TEXT, new_status TEXT, note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS email_templates (id SERIAL PRIMARY KEY, title TEXT NOT NULL, subject TEXT, body TEXT);
`).then(() => console.log("✔ Sémák rendben.")).catch(err => console.error("❌ Séma hiba:", err));