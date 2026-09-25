const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

console.log("--> FIGYELEM: CRM ENGINE FUT (0.1% DISCIPLINE ÉLESÍTVE)!");

process.on('uncaughtException', (err) => console.error('KIVÉTELES HIBA:', err));
process.on('unhandledRejection', (reason, promise) => console.error('NEM KEZELT PROMISE HIBA:', reason));

const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbytG-MduXJ2sCgWKkdMipPZZJAbopjVz0XI5sASh-7SRlWZurT4fBjqB0pBuTjr0XxhPw/exec';

async function syncToSheets(partnerData, action) {
  if (!SHEETS_WEBHOOK_URL) return;
  try {
    const response = await fetch(SHEETS_WEBHOOK_URL, {
      method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, partner: partnerData })
    });
    await response.text();
  } catch (err) { console.error('[Google Sheets Hiba]:', err.message); }
}

app.get('/api/partners', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM partners ORDER BY id DESC')).rows); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners', async (req, res) => {
  try {
    const p = req.body;
    const newPartner = await pool.query(
      `INSERT INTO partners (company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, status, manager, accepted_offer, chosen_package, addons, website, personality_type, personality_custom, existing_system, discount_applied, discount_details, lead_source, lead_source_custom, created_at, last_interaction_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [p.company_name, p.contact_person, p.phone, p.email || '', p.revenue || '', p.tax_number || '', p.billing_address || '', p.headquarters || '', '1. Új lead', p.manager || '', p.accepted_offer || '', p.chosen_package || '', p.addons || '', p.website || '', p.personality_type || '', p.personality_custom || '', p.existing_system || '', p.discount_applied || false, p.discount_details || '', p.lead_source || '', p.lead_source_custom || '']
    );
    syncToSheets(newPartner.rows[0], 'CREATE');
    res.json(newPartner.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:id', async (req, res) => {
  try {
    const p = req.body;
    const updatedPartner = await pool.query(
      `UPDATE partners SET company_name=$1, contact_person=$2, phone=$3, email=$4, revenue=$5, tax_number=$6, billing_address=$7, headquarters=$8, status=$9, manager=$10, accepted_offer=$11, chosen_package=$12, addons=$13, website=$14, personality_type=$15, personality_custom=$16, existing_system=$17, discount_applied=$18, discount_details=$19, lead_source=$20, lead_source_custom=$21, last_interaction_at=CURRENT_TIMESTAMP WHERE id = $22 RETURNING *`,
      [p.company_name, p.contact_person, p.phone, p.email || '', p.revenue || '', p.tax_number || '', p.billing_address || '', p.headquarters || '', p.status, p.manager || '', p.accepted_offer || '', p.chosen_package || '', p.addons || '', p.website || '', p.personality_type || '', p.personality_custom || '', p.existing_system || '', p.discount_applied || false, p.discount_details || '', p.lead_source || '', p.lead_source_custom || '', req.params.id]
    );
    syncToSheets(updatedPartner.rows[0], 'UPDATE');
    res.json(updatedPartner.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:id/status', async (req, res) => {
  try {
    const { status, note, lost_reason, payment_type, next_interaction_date, offer_validity, contract_deadline, proforma_validity, handover_deadline } = req.body;
    const oldRes = await pool.query('SELECT status FROM partners WHERE id = $1', [req.params.id]);
    const oldStatus = oldRes.rows[0] ? oldRes.rows[0].status : '';
    
    const updatedPartner = await pool.query(
      `UPDATE partners SET status=$1, last_interaction_at=CURRENT_TIMESTAMP, lost_reason=COALESCE($2, lost_reason), payment_type=COALESCE($3, payment_type), next_interaction_date=COALESCE($4, next_interaction_date), offer_validity=COALESCE($5, offer_validity), contract_deadline=COALESCE($6, contract_deadline), proforma_validity=COALESCE($7, proforma_validity), handover_deadline=COALESCE($8, handover_deadline) WHERE id = $9 RETURNING *`,
      [status, lost_reason || null, payment_type || null, next_interaction_date || null, offer_validity || null, contract_deadline || null, proforma_validity || null, handover_deadline || null, req.params.id]
    );
    
    const logNote = note && note.trim() !== '' ? `${oldStatus} ➔ ${status} | Ok/Megjegyzés: ${note}` : `${oldStatus} ➔ ${status}`;
    await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)', [req.params.id, 'Rendszer', 'STÁTUSZVÁLTÁS', oldStatus, status, logNote]);
    syncToSheets(updatedPartner.rows[0], 'STATUS_UPDATE');
    res.json(updatedPartner.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/logs', async (req, res) => {
  try {
    await pool.query('UPDATE partners SET last_interaction_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
    const newLog = await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, 'Admin', req.body.action_type || 'MEGJEGYZÉS', req.body.note]);
    res.json(newLog.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// -- AI RIPORT GENERÁLÓ VÉGPONT --
app.post('/api/partners/:id/ai-summary', async (req, res) => {
  try {
    const partnerId = req.params.id;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: "Szerver konfigurációs hiba: Hiányzik a GEMINI_API_KEY." });
    }

    const partnerRes = await pool.query('SELECT * FROM partners WHERE id = $1', [partnerId]);
    if (partnerRes.rows.length === 0) return res.status(404).json({ error: "Partner nem található." });
    
    const logsRes = await pool.query('SELECT action_type, note, created_at FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC LIMIT 20', [partnerId]);

    const p = partnerRes.rows[0];
    const logsText = logsRes.rows.map(l => `[${new Date(l.created_at).toISOString().split('T')[0]}] ${l.action_type}: ${l.note}`).join('\n');

    const partnerDataText = `
      Cégnév: ${p.company_name}
      Döntéshozó: ${p.contact_person}
      Státusz: ${p.status}
      Személyiség: ${p.personality_type}
      Üzleti csomag: ${p.chosen_package}
      Utolsó 20 interakció:
      ${logsText}
    `;

    const prompt = `Te egy szigorú, elemző CRM asszisztens vagy. Készíts egy maximum 3 mondatos, tűpontos vezetői riportot az alábbi adatokból. Térj ki a jelenlegi állapotra, a legnagyobb kockázatra (ha van) és a javasolt következő lépésre. Ne használj bevezető udvariaskodást. Adatok:\n${partnerDataText}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    if (!data.candidates) return res.status(500).json({ error: "Az AI nem küldött érvényes választ.", details: data });

    res.json({ summary: data.candidates[0].content.parts[0].text });
  } catch (err) {
    console.error("AI API Hiba:", err);
    res.status(500).json({ error: "Szerverhiba az AI riport generálásakor." });
  }
});

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
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note, related_task_id) VALUES ($1, $2, $3, $4, $5)', [req.params.id, 'Rendszer', 'LEJÁRT FELADAT', `${task.description} (${task.due_date})`, task.id]);
        task.flagged_overdue = true;
      }
    }
    res.json(tasks.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners/:id/tasks', async (req, res) => {
  try {
    const newTask = await pool.query('INSERT INTO tasks (partner_id, description, due_date) VALUES ($1, $2, $3) RETURNING *', [req.params.id, req.body.description, req.body.due_date || null]);
    await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note, related_task_id) VALUES ($1, $2, $3, $4, $5)', [req.params.id, 'Admin', 'ÚJ FELADAT', `${req.body.description} ${req.body.due_date ? `(${req.body.due_date})` : ''}`, newTask.rows[0].id]);
    res.json(newTask.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:partnerId/tasks/:taskId/complete', async (req, res) => {
  try {
    await pool.query('UPDATE partners SET last_interaction_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.partnerId]);
    const updatedTask = await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *', [req.params.taskId]);
    if (updatedTask.rows.length > 0) {
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note, related_task_id) VALUES ($1, $2, $3, $4, $5)', [req.params.partnerId, 'Admin', 'FELADAT KÉSZ', `Elvégezve: ${updatedTask.rows[0].description}`, updatedTask.rows[0].id]);
    }
    res.json(updatedTask.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// -- KONZÍLIUM VÉGPONTOK --
app.get('/api/partners/:id/consultations', async (req, res) => {
    try { res.json((await pool.query('SELECT * FROM consultations WHERE partner_id = $1 ORDER BY scheduled_date ASC', [req.params.id])).rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/partners/:id/consultations', async (req, res) => {
    try { res.json((await pool.query('INSERT INTO consultations (partner_id, scheduled_date, notes) VALUES ($1, $2, $3) RETURNING *', [req.params.id, req.body.scheduled_date, req.body.notes || ''])).rows[0]); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/consultations/:id', async (req, res) => {
    try { res.json((await pool.query('UPDATE consultations SET scheduled_date=$1, notes=$2, is_completed=$3 WHERE id=$4 RETURNING *', [req.body.scheduled_date, req.body.notes, req.body.is_completed, req.params.id])).rows[0]); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/consultations/:id', async (req, res) => {
    try { await pool.query('DELETE FROM consultations WHERE id = $1', [req.params.id]); res.json({ message: 'Törölve.' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/partners/:id/documents', async (req, res) => { try { res.json((await pool.query('SELECT * FROM documents WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id])).rows); } catch (err) { res.status(500).json({ error: err.message }); }});
app.post('/api/partners/:id/documents', async (req, res) => {
  try {
    const { doc_type, doc_name, doc_url, doc_note } = req.body;
    const newDoc = await pool.query('INSERT INTO documents (partner_id, doc_type, doc_name, doc_url, doc_note) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.params.id, doc_type, doc_name, doc_url, doc_note || '']);
    await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Admin', 'ÚJ DOKUMENTUM', `${doc_name} ${doc_note ? `(Megjegyzés: ${doc_note})` : ''}`]);
    res.json(newDoc.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/partners/:partnerId/documents/:docId', async (req, res) => { try { await pool.query('DELETE FROM documents WHERE id = $1', [req.params.docId]); res.json({ message: 'Törölve.' }); } catch (err) { res.status(500).json({ error: err.message }); }});

app.get('/api/email-templates', async (req, res) => { try { res.json((await pool.query('SELECT * FROM email_templates ORDER BY id ASC')).rows); } catch (err) { res.status(500).json({ error: err.message }); }});
app.post('/api/email-templates', async (req, res) => { try { res.json((await pool.query('INSERT INTO email_templates (title, subject, body) VALUES ($1, $2, $3) RETURNING *', [req.body.title, req.body.subject, req.body.body])).rows[0]); } catch (err) { res.status(500).json({ error: err.message }); }});
app.put('/api/email-templates/:id', async (req, res) => { try { res.json((await pool.query('UPDATE email_templates SET title = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *', [req.body.title, req.body.subject, req.body.body, req.params.id])).rows[0]); } catch (err) { res.status(500).json({ error: err.message }); }});
app.delete('/api/email-templates/:id', async (req, res) => { try { await pool.query('DELETE FROM email_templates WHERE id = $1', [req.params.id]); res.json({ message: 'Törölve.' }); } catch (err) { res.status(500).json({ error: err.message }); }});

app.get('/api/partners/:id/logs', async (req, res) => { try { res.json((await pool.query('SELECT * FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id])).rows); } catch (err) { res.status(500).json({ error: err.message }); }});
app.delete('/api/partners/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM consultations WHERE partner_id = $1', [req.params.id]);
    await pool.query('DELETE FROM documents WHERE partner_id = $1', [req.params.id]);
    await pool.query('DELETE FROM tasks WHERE partner_id = $1', [req.params.id]);
    await pool.query('DELETE FROM audit_logs WHERE partner_id = $1', [req.params.id]);
    await pool.query('DELETE FROM partners WHERE id = $1', [req.params.id]);
    res.json({ message: 'Partner törölve.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`A szerver stabilan fut a http://localhost:${PORT} címen.`));

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
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS lead_source TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS lead_source_custom TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS personality_type TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS personality_custom TEXT;
 
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS lost_reason TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS existing_system TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS discount_applied BOOLEAN DEFAULT false;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS discount_details TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS payment_type TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS next_interaction_date TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS offer_validity TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS contract_deadline TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS proforma_validity TEXT;
 ALTER TABLE partners ADD COLUMN IF NOT EXISTS handover_deadline TEXT;
 
 CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, partner_id INT, description TEXT NOT NULL, is_completed BOOLEAN DEFAULT false, due_date TEXT, flagged_overdue BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, partner_id INT, doc_type TEXT, doc_name TEXT, doc_url TEXT, doc_note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
 
 CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, partner_id INT, user_name TEXT, action_type TEXT, old_status TEXT, new_status TEXT, note TEXT, related_task_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
 ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS related_task_id INT;
 
 CREATE TABLE IF NOT EXISTS email_templates (id SERIAL PRIMARY KEY, title TEXT NOT NULL, subject TEXT, body TEXT);
 
 CREATE TABLE IF NOT EXISTS consultations (id SERIAL PRIMARY KEY, partner_id INT, scheduled_date TEXT, notes TEXT, is_completed BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
`).then(() => console.log("✔ Adatbázis motor élesítve.")).catch(err => console.error("❌ Séma hiba:", err));