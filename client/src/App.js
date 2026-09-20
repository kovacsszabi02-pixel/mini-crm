const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

console.log("--> FIGYELEM: TOP 0.1% CRM ENGINE FUT (TELJES VERZIÓ)!");

process.on('uncaughtException', (err) => console.error('KIVÉTELES HIBA:', err));
process.on('unhandledRejection', (reason, promise) => console.error('NEM KEZELT PROMISE HIBA:', reason));

const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxQgeLWo1iLA_9pEm5_Njj1k330wVqwviw5Oj2Bp-F97-6UQL0oNEz5af5yWzAo5AxK/exec'; 

async function syncToSheets(partnerData, action) {
    if (!SHEETS_WEBHOOK_URL) return;
    try {
        const response = await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, partner: partnerData })
        });
        const resultText = await response.text();
        console.log(`[Google Sheets] Státusz: ${response.status} | Cég: ${partnerData.company_name}`);
    } catch (err) { console.error('[Google Sheets Hiba]:', err.message); }
}

app.get('/api/partners', async (req, res) => {
    try { res.json((await pool.query('SELECT * FROM partners ORDER BY id DESC')).rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/partners', async (req, res) => {
    try {
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, manager, accepted_offer, chosen_package, addons, website, personality_type, existing_system, consultation_count, discount_applied, discount_details } = req.body;
        const newPartner = await pool.query(
            `INSERT INTO partners (company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, status, manager, accepted_offer, chosen_package, addons, website, personality_type, existing_system, consultation_count, discount_applied, discount_details, created_at, last_interaction_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', headquarters || '', '1. Új lead', manager || '', accepted_offer || '', chosen_package || '', addons || '', website || '', personality_type || '', existing_system || '', consultation_count || '', discount_applied || false, discount_details || '']
        );
        syncToSheets(newPartner.rows[0], 'CREATE');
        res.json(newPartner.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:id', async (req, res) => {
    try {
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, headquarters, status, manager, accepted_offer, chosen_package, addons, website, personality_type, existing_system, consultation_count, discount_applied, discount_details } = req.body;
        const updatedPartner = await pool.query(
            `UPDATE partners SET company_name = $1, contact_person = $2, phone = $3, email = $4, revenue = $5, tax_number = $6, billing_address = $7, headquarters = $8, status = $9, manager = $10, accepted_offer = $11, chosen_package = $12, addons = $13, website = $14, personality_type = $15, existing_system = $16, consultation_count = $17, discount_applied = $18, discount_details = $19, last_interaction_at = CURRENT_TIMESTAMP
             WHERE id = $20 RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', headquarters || '', status, manager || '', accepted_offer || '', chosen_package || '', addons || '', website || '', personality_type || '', existing_system || '', consultation_count || '', discount_applied || false, discount_details || '', req.params.id]
        );
        if (updatedPartner.rows.length === 0) return res.status(404).json({ error: 'Nincs partner.' });
        syncToSheets(updatedPartner.rows[0], 'UPDATE');
        res.json(updatedPartner.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/partners/:id/status', async (req, res) => {
    try {
        const { status, note, lost_reason, payment_type, next_interaction_date } = req.body;
        const oldRes = await pool.query('SELECT status FROM partners WHERE id = $1', [req.params.id]);
        const oldStatus = oldRes.rows[0] ? oldRes.rows[0].status : '';
        
        const updatedPartner = await pool.query(
            `UPDATE partners SET status = $1, last_interaction_at = CURRENT_TIMESTAMP, lost_reason = COALESCE($2, lost_reason), payment_type = COALESCE($3, payment_type), next_interaction_date = COALESCE($4, next_interaction_date) WHERE id = $5 RETURNING *`, 
            [status, lost_reason || null, payment_type || null, next_interaction_date || null, req.params.id]
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
        await pool.query('UPDATE partners SET last_interaction_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.partnerId]);
        const updatedTask = await pool.query('UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *', [req.params.taskId]);
        if (updatedTask.rows.length > 0) await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.partnerId, 'Admin', 'FELADAT KÉSZ', `Elvégezve: ${updatedTask.rows[0].description}`]);
        res.json(updatedTask.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/partners/:id/documents', async (req, res) => {
    try { res.json((await pool.query('SELECT * FROM documents WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id])).rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/partners/:id/documents', async (req, res) => {
    try {
        const newDoc = await pool.query('INSERT INTO documents (partner_id, doc_type, doc_name, doc_url) VALUES ($1, $2, $3, $4) RETURNING *', [req.params.id, req.body.doc_type, req.body.doc_name, req.body.doc_url]);
        await pool.query('INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)', [req.params.id, 'Admin', 'ÚJ DOKUMENTUM', `${req.body.doc_name}`]);
        res.json(newDoc.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/partners/:partnerId/documents/:docId', async (req, res) => {
    try { await pool.query('DELETE FROM documents WHERE id = $1', [req.params.docId]); res.json({ message: 'Törölve.' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/email-templates', async (req, res) => {
    try { res.json((await pool.query('SELECT * FROM email_templates ORDER BY id ASC')).rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/email-templates', async (req, res) => {
    try { res.json((await pool.query('INSERT INTO email_templates (title, subject, body) VALUES ($1, $2, $3) RETURNING *', [req.body.title, req.body.subject, req.body.body])).rows[0]); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/email-templates/:id', async (req, res) => {
    try { res.json((await pool.query('UPDATE email_templates SET title = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *', [req.body.title, req.body.subject, req.body.body, req.params.id])).rows[0]); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/email-templates/:id', async (req, res) => {
    try { await pool.query('DELETE FROM email_templates WHERE id = $1', [req.params.id]); res.json({ message: 'Törölve.' }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/partners/:id/logs', async (req, res) => {
    try { res.json((await pool.query('SELECT * FROM audit_logs WHERE partner_id = $1 ORDER BY created_at DESC', [req.params.id])).rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/partners/:id', async (req, res) => {
    try {
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
  
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS lost_reason TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS personality_type TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS existing_system TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS consultation_count TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS discount_applied BOOLEAN DEFAULT false;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS discount_details TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS payment_type TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS next_interaction_date TEXT;
  
  CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, partner_id INT, description TEXT NOT NULL, is_completed BOOLEAN DEFAULT false, due_date TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TEXT;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS flagged_overdue BOOLEAN DEFAULT false;

  CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, partner_id INT, doc_type TEXT, doc_name TEXT, doc_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, partner_id INT, user_name TEXT, action_type TEXT, old_status TEXT, new_status TEXT, note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS email_templates (id SERIAL PRIMARY KEY, title TEXT NOT NULL, subject TEXT, body TEXT);
`).then(() => console.log("✔ Adatbázis motor élesítve.")).catch(err => console.error("❌ Séma hiba:", err));
2. App.js (A teljes felületi kód)
(Hibátlanul használja az összes deklarált változót, tartalmazza a mai feladatokat, a dokumentumokat, a szerkesztőt, és a kíméletlen státusz-triggert).
JavaScript
import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mini-crm-44xt.onrender.com';

const STATUSES = [
  '1. Új lead', '2. Kapcsolatfelvétel alatt', '3. Tárgyalás', '4. Ajánlat kiküldés',
  '5. Szerződésírás', '6. Döntésre vár', '7. Díjbekérő', '8. Fizetésre vár', '9. Számlaírás',
  '10. Sablonírás', '11. Átadásra vár', '12. Teljesített', '13. Elveszített', '14. Konzílium', '15. Utánkövetés'
];

const PERSONALITIES = ['Nincs megadva', 'Driver', 'Analitikus', 'Biztonsági játékos', 'Státuszvadász', 'Empatha', 'Innovátor', 'Költségérzékeny', 'Hatékonyságmániás', 'Szkeptikus', 'Örökségépítő', 'Belső Szabotőr', 'Egyéb'];
const LOST_REASONS = ['Túl drága', 'Eltűnt', 'Konkurenciát választotta', 'Rossz időzítés', 'Egyéb'];

const getTodayStr = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, days) => { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };
const getWorkingDaysLater = (days) => { let d = new Date(); let count = 0; while(count < days) { d.setDate(d.getDate() + 1); if(d.getDay() !== 0 && d.getDay() !== 6) count++; } return d.toISOString().split('T')[0]; };
const getDaysSince = (dateString) => { if (!dateString) return 0; return Math.floor(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)); };

function AddPartnerForm({ onPartnerAdded }) {
  const [formData, setFormData] = useState({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '', personality_type: 'Nincs megadva', existing_system: '', consultation_count: '', discount_applied: false, discount_details: '' });
  const handleChange = (e) => { const { name, value, type, checked } = e.target; if (name === 'phone') { setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9+\s]/g, '') })); return; } setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
  const handleSubmit = async (e) => { e.preventDefault(); await fetch(`${BACKEND_URL}/api/partners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); setFormData({ company_name: '', contact_person: '', phone: '', email: '', website: '', revenue: '', tax_number: '', billing_address: '', headquarters: '', manager: '', accepted_offer: '', chosen_package: '', addons: '', personality_type: 'Nincs megadva', existing_system: '', consultation_count: '', discount_applied: false, discount_details: '' }); onPartnerAdded(); };

  return (
    <div style={{ background: '#fff', padding: '20px', border: '2px solid #000', marginBottom: '20px' }}>
      <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Új Partner Rögzítése</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>CÉGNÉV *</label><br/><input name="company_name" value={formData.company_name} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>DÖNTÉSHOZÓ *</label><br/><input name="contact_person" value={formData.contact_person} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>TELEFON *</label><br/><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>EMAIL</label><br/><input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>SZEMÉLYISÉGTÍPUS</label><br/><select name="personality_type" value={formData.personality_type} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}>{PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>MEGLÉVŐ RENDSZER</label><br/><input name="existing_system" value={formData.existing_system} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #000' }}>
            <div style={{ flex: '1 1 100%' }}><strong style={{ fontSize: '12px', textTransform: 'uppercase' }}>Üzleti Paraméterek</strong></div>
            <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>CSOMAG</label><br/><input name="chosen_package" value={formData.chosen_package} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
            <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>KONZÍLIUM SZÁM</label><br/><input name="consultation_count" value={formData.consultation_count} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
            <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>KIEGÉSZÍTŐK</label><br/><input name="addons" value={formData.addons} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
            <div style={{ flex: '1 1 22%', display: 'flex', alignItems: 'center', gap: '10px' }}><input type="checkbox" name="discount_applied" checked={formData.discount_applied} onChange={handleChange} style={{ transform: 'scale(1.5)' }}/><label style={{ fontSize: '11px', fontWeight: 'bold' }}>KEDVEZMÉNY VOLT?</label></div>
            {formData.discount_applied && ( <div style={{ flex: '1 1 100%' }}><input name="discount_details" placeholder="Kedvezmény indoklása..." value={formData.discount_details} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div> )}
        </div>
        <div style={{ marginTop: '15px' }}><button type="submit" style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>VÉGREHAJTÁS (Mentés)</button></div>
      </form>
    </div>
  );
}

function App() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  // Form states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [triggerData, setTriggerData] = useState({ next_interaction: '', reason: '', details: '', meeting_date: '', expected_decision: '', expected_payment: '', payment_type: '' });
  const [plainNote, setPlainNote] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplBody, setNewTplBody] = useState('');
  const [selectedTplId, setSelectedTplId] = useState('');
  const [editingTplId, setEditingTplId] = useState(null);

  const fetchPartners = async () => { const res = await fetch(`${BACKEND_URL}/api/partners`); setPartners(await res.json()); };
  const fetchLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/logs`); setLogs(await res.json()); };
  const fetchTasksAndLogs = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/tasks`); setTasks(await res.json()); fetchLogs(id); fetchTodayTasks(); };
  const fetchDocuments = async (id) => { const res = await fetch(`${BACKEND_URL}/api/partners/${id}/documents`); setDocuments(await res.json()); };
  const fetchEmailTemplates = async () => { const res = await fetch(`${BACKEND_URL}/api/email-templates`); setEmailTemplates(await res.json()); };
  const fetchTodayTasks = async () => { const res = await fetch(`${BACKEND_URL}/api/tasks/today`); setTodayTasks(await res.json()); };

  useEffect(() => { fetchPartners(); fetchTodayTasks(); fetchEmailTemplates(); }, []);

  const handleSelectPartner = (partner) => { 
      setSelectedPartner(partner); setPlainNote(''); setNewTaskDesc(''); setNewTaskDate(''); setNewDocName(''); setNewDocUrl(''); setSelectedTplId(''); setEditingTplId(null);
      fetchTasksAndLogs(partner.id); fetchDocuments(partner.id);
      setTimeout(() => { document.getElementById('partner-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
  };

  const handleStatusChangeInit = (e) => {
      const targetStatus = e.target.value;
      if(targetStatus === selectedPartner.status) return;
      setPendingStatus(targetStatus);
      setTriggerData({ next_interaction: '', reason: '', details: '', meeting_date: '', expected_decision: '', expected_payment: '', payment_type: '' });
      setShowStatusModal(true);
  };

  const executeStatusChange = async (e) => {
      e.preventDefault();
      let finalNote = triggerData.details;
      if (pendingStatus === '13. Elveszített') finalNote = `${triggerData.reason} - ${triggerData.details}`;
      if (pendingStatus === '3. Tárgyalás') finalNote = `Dátum: ${triggerData.meeting_date} | ${triggerData.details}`;
      
      const payload = { status: pendingStatus, note: finalNote, next_interaction_date: triggerData.next_interaction, lost_reason: triggerData.reason, payment_type: triggerData.payment_type };
      const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      
      if(res.ok) {
          const updated = await res.json();
          setSelectedPartner(updated); setShowStatusModal(false); fetchPartners();
          const postTask = async (desc, date) => { await fetch(`${BACKEND_URL}/api/partners/${updated.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: desc, due_date: date }) }); };

          if (pendingStatus === '2. Kapcsolatfelvétel alatt') await postTask('Megkeresés (2 munkanapon belül)', getWorkingDaysLater(2));
          if (pendingStatus === '3. Tárgyalás' && triggerData.meeting_date) await postTask('Biztosító SMS küldése', addDays(triggerData.meeting_date, -1));
          if (pendingStatus === '4. Ajánlat kiküldés') await postTask('Ajánlat megírása és elküldése', getTodayStr());
          if (pendingStatus === '5. Szerződésírás') await postTask('Szerződés megírása és elküldése', getTodayStr());
          if (pendingStatus === '6. Döntésre vár') await postTask('Döntés utánkövetése', triggerData.expected_decision || getWorkingDaysLater(2));
          if (pendingStatus === '7. Díjbekérő') await postTask('Díjbekérő kiállítása és elküldése', getTodayStr());
          if (pendingStatus === '8. Fizetésre vár') await postTask('Számlaírás (Fizetés beérkezése után)', triggerData.expected_payment || addDays(getTodayStr(), 8));
          if (pendingStatus === '10. Sablonírás') await postTask('Sablonok átírása', getTodayStr());
          if (pendingStatus === '11. Átadásra vár') await postTask('Átadás lebonyolítása', getTodayStr());
          
          fetchTasksAndLogs(updated.id);
      }
  };

  const handleGhosting = async () => {
      if(!window.confirm("ZOMBIE LEAD SWEEPER ÉLESÍTVE. Eltűnt státuszba teszed?")) return;
      const payload = { status: '13. Elveszített', lost_reason: 'Eltűnt', note: 'ZOMBIE LEAD - Eltűnt', next_interaction_date: addDays(getTodayStr(), 30) };
      const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if(res.ok) {
          await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: 'ÚJRAÉLESZTÉS (Zombie Lead)', due_date: addDays(getTodayStr(), 30) }) });
          setSelectedPartner(await res.json()); fetchPartners(); fetchTasksAndLogs(selectedPartner.id);
      }
  };

  // RESTORED FUNCTIONS
  const handleSaveEdit = async (e) => { e.preventDefault(); const res = await fetch(`${BACKEND_URL}/api/partners/${editingPartner.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPartner) }); if (res.ok) { const updated = await res.json(); if (selectedPartner?.id === updated.id) setSelectedPartner(updated); setEditingPartner(null); fetchPartners(); } };
  const handleDeletePartner = async (id) => { if (!window.confirm("Biztosan törlöd?")) return; const res = await fetch(`${BACKEND_URL}/api/partners/${id}`, { method: 'DELETE' }); if (res.ok) { if (selectedPartner?.id === id) setSelectedPartner(null); fetchPartners(); fetchTodayTasks(); } };
  const handleAddPlainNote = async () => { if (!plainNote.trim()) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: plainNote, action_type: 'MEGJEGYZÉS' }) }); if (res.ok) { setPlainNote(''); fetchLogs(selectedPartner.id); fetchPartners(); } };
  const handleAddTask = async () => { if (!newTaskDesc.trim()) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: newTaskDesc, due_date: newTaskDate }) }); if (res.ok) { setNewTaskDesc(''); setNewTaskDate(''); fetchTasksAndLogs(selectedPartner.id); } };
  const completeTask = async (taskId) => { await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/tasks/${taskId}/complete`, { method: 'PUT' }); fetchTasksAndLogs(selectedPartner.id); fetchPartners(); fetchTodayTasks(); };
  
  const handleAddDocument = async (docType) => { if (!newDocName.trim() || !newDocUrl.trim()) return alert('Adj meg nevet és linket!'); const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc_type: docType, doc_name: newDocName, doc_url: newDocUrl }) }); if (res.ok) { setNewDocName(''); setNewDocUrl(''); fetchDocuments(selectedPartner.id); fetchLogs(selectedPartner.id); } };
  const handleDeleteDocument = async (docId) => { if (!window.confirm("Törlöd?")) return; const res = await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/documents/${docId}`, { method: 'DELETE' }); if (res.ok) fetchDocuments(selectedPartner.id); };
  
  const handleSaveTemplate = async () => { if (!newTplTitle.trim()) return; const endpoint = editingTplId ? `${BACKEND_URL}/api/email-templates/${editingTplId}` : `${BACKEND_URL}/api/email-templates`; const res = await fetch(endpoint, { method: editingTplId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTplTitle, subject: newTplSubject, body: newTplBody }) }); if (res.ok) { setEditingTplId(null); setNewTplTitle(''); setNewTplSubject(''); setNewTplBody(''); fetchEmailTemplates(); } };
  const handleDeleteTemplate = async () => { if (!selectedTplId || !window.confirm("Törlöd?")) return; const res = await fetch(`${BACKEND_URL}/api/email-templates/${selectedTplId}`, { method: 'DELETE' }); if (res.ok) { setSelectedTplId(''); fetchEmailTemplates(); } };
  const sendEmail = async () => { if (!selectedPartner.email) return alert('Nincs email!'); if (!selectedTplId) return alert('Válassz sablont!'); const tpl = emailTemplates.find(t => t.id.toString() === selectedTplId); if (tpl) { await fetch(`${BACKEND_URL}/api/partners/${selectedPartner.id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: `E-mail küldve: ${tpl.title}`, action_type: 'E-MAIL KÜLDVE' }) }); fetchLogs(selectedPartner.id); fetchPartners(); window.location.href = `mailto:${selectedPartner.email}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`; } };

  const filtered = partners.filter(p => (statusFilter === '' || p.status === statusFilter) && (p.company_name.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', background: '#fff', color: '#000' }}>
      
      {showStatusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', padding: '30px', border: '4px solid #000', width: '500px' }}>
                <h2 style={{ textTransform: 'uppercase', marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>Státusz Váltás: {pendingStatus}</h2>
                <form onSubmit={executeStatusChange}>
                    {pendingStatus !== '12. Teljesített' && pendingStatus !== '13. Elveszített' && (
                        <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Következő interakció *</label><br/><input type="date" required value={triggerData.next_interaction} onChange={e => setTriggerData({...triggerData, next_interaction: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000' }}/></div>
                    )}
                    {pendingStatus === '13. Elveszített' && (
                        <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>INDOKLÁS *</label><br/><select required value={triggerData.reason} onChange={e => setTriggerData({...triggerData, reason: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000', marginBottom: '5px' }}><option value="">Válassz...</option>{LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select><input type="text" placeholder="Részletek..." required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #000' }}/></div>
                    )}
                    {pendingStatus === '3. Tárgyalás' && (
                        <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Tárgyalás dátuma *</label><br/><input type="date" required value={triggerData.meeting_date} onChange={e => setTriggerData({...triggerData, meeting_date: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000', marginBottom: '5px' }}/><input type="text" placeholder="Mi történt eddig? *" required value={triggerData.details} onChange={e => setTriggerData({...triggerData, details: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #000' }}/></div>
                    )}
                    {pendingStatus === '5. Szerződésírás' && (
                        <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Fizetési konstrukció *</label><br/><select required value={triggerData.payment_type} onChange={e => setTriggerData({...triggerData, payment_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000', marginBottom: '5px' }}><option value="">Válassz...</option><option value="Egyösszegű">Egyösszegű</option><option value="Részletfizetés">Részletfizetés</option></select><label style={{ fontWeight: 'bold' }}>Meddig várunk döntésre? *</label><br/><input type="date" required value={triggerData.expected_decision} onChange={e => setTriggerData({...triggerData, expected_decision: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000' }}/></div>
                    )}
                    {pendingStatus === '8. Fizetésre vár' && (
                        <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold' }}>Fizetési Határidő *</label><br/><input type="date" required value={triggerData.expected_payment} onChange={e => setTriggerData({...triggerData, expected_payment: e.target.value})} style={{ width: '100%', padding: '10px', border: '2px solid #000' }}/></div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" style={{ flex: 1, padding: '15px', background: '#000', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>VÉGREHAJTÁS</button>
                        <button type="button" onClick={() => setShowStatusModal(false)} style={{ padding: '15px', background: '#fff', color: '#000', fontWeight: 'bold', border: '2px solid #000', cursor: 'pointer' }}>MÉGSE</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {editingPartner && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #000' }}>
          <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '10px' }}>SZERKESZTÉS: {editingPartner.company_name}</h3>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Cégnév</label><br/><input value={editingPartner.company_name} onChange={(e) => setEditingPartner({...editingPartner, company_name: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Személyiségtípus</label><br/><select value={editingPartner.personality_type || 'Nincs megadva'} onChange={(e) => setEditingPartner({...editingPartner, personality_type: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}>{PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Meglévő rendszer</label><br/><input value={editingPartner.existing_system || ''} onChange={(e) => setEditingPartner({...editingPartner, existing_system: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Csomag</label><br/><input value={editingPartner.chosen_package || ''} onChange={(e) => setEditingPartner({...editingPartner, chosen_package: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Konzílium</label><br/><input value={editingPartner.consultation_count || ''} onChange={(e) => setEditingPartner({...editingPartner, consultation_count: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>
              <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Kedvezmény Volt?</label><br/><input type="checkbox" checked={editingPartner.discount_applied || false} onChange={(e) => setEditingPartner({...editingPartner, discount_applied: e.target.checked})} style={{ transform: 'scale(1.5)', marginTop: '10px' }}/></div>
              {editingPartner.discount_applied && <div style={{ flex: '1 1 22%' }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>Kedvezmény oka</label><br/><input value={editingPartner.discount_details || ''} onChange={(e) => setEditingPartner({...editingPartner, discount_details: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #000' }}/></div>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Mentés</button>
              <button type="button" onClick={() => setEditingPartner(null)} style={{ padding: '10px 20px', background: '#fff', border: '2px solid #000', fontWeight: 'bold', cursor: 'pointer' }}>Mégse</button>
            </div>
          </form>
        </div>
      )}

      <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '10px' }}>TOP 0.1% Értékesítési Gépezet</h1>
      <AddPartnerForm onPartnerAdded={fetchPartners} />

      {/*🔥 MAI ÉS LEJÁRT FELADATOK NÉZET (Itt használjuk a todayTasks változót) 🔥*/}
      <div style={{ background: '#fff', border: '2px solid #000', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, color: 'red', textTransform: 'uppercase', borderBottom: '2px solid red', paddingBottom: '10px' }}>🔥 MAI ÉS LEJÁRT FELADATOK ({todayTasks.length})</h3>
          {todayTasks.length === 0 ? (
              <p style={{ fontWeight: 'bold' }}>Nincs aktív feladat. (Vagy hazudsz magadnak, vagy tényleg mindent megcsináltál.)</p>
          ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {todayTasks.map(t => (
                      <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #000', marginBottom: '10px', background: '#ffe6e6' }}>
                          <input type="checkbox" onChange={async () => { 
                              await fetch(`${BACKEND_URL}/api/partners/${t.partner_id}/tasks/${t.id}/complete`, { method: 'PUT' }); 
                              fetchTodayTasks(); 
                              fetchPartners(); 
                              if (selectedPartner && selectedPartner.id === t.partner_id) {
                                  fetchTasksAndLogs(t.partner_id);
                              } 
                          }} style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
                          <div>
                              <strong style={{ display: 'block', fontSize: '16px', textTransform: 'uppercase' }}>{t.company_name}</strong>
                              <span>{t.description}</span>
                              <span style={{ marginLeft: '15px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>HATÁRIDŐ: {t.due_date}</span>
                          </div>
                      </li>
                  ))}
              </ul>
          )}
      </div>

      <div style={{ background: '#fff', border: '2px solid #000', padding: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="Keresés..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #000' }}/>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #000' }}>
            <option value="">ÖSSZES STÁTUSZ</option>
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead style={{ background: '#000', color: '#fff' }}><tr><th>Cégnév / Csomag</th><th>Státusz</th><th>SLA / Inaktivitás</th><th>Művelet</th></tr></thead>
          <tbody>
            {filtered.map(p => {
              const inactiveDays = getDaysSince(p.last_interaction_at);
              const isActive = !['12. Teljesített', '13. Elveszített'].includes(p.status);
              const isBreach = isActive && inactiveDays >= 3;
              return (
                <tr key={p.id} style={{ background: isBreach ? '#ffe6e6' : '#fff' }}>
                  <td><strong style={{ fontSize: '15px' }}>{p.company_name}</strong><br/><span style={{ fontSize: '12px', color: '#666' }}>{p.chosen_package} | {p.personality_type}</span></td>
                  <td><strong>{p.status}</strong></td>
                  <td style={{ color: isBreach ? 'red' : 'black', fontWeight: isBreach ? 'bold' : 'normal' }}>{inactiveDays} napja érintetlen</td>
                  <td style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleSelectPartner(p)} style={{ background: '#000', color: '#fff', padding: '8px 15px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>MEGNYITÁS</button>
                      <button onClick={() => setEditingPartner(p)} style={{ background: '#fff', color: '#000', border: '2px solid #000', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold' }}>Szerkeszt</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedPartner && (
        <div id="partner-workspace" style={{ borderTop: '6px solid #000', paddingTop: '30px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
             <div>
                <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '28px' }}>{selectedPartner.company_name}</h2>
                <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
                    <div style={{ border: '2px solid #000', padding: '10px', background: '#f5f5f5' }}><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold' }}>LEAD KORA</span><span style={{ fontSize: '20px', fontWeight: 'bold' }}>{getDaysSince(selectedPartner.created_at)} NAP</span></div>
                    <div style={{ border: `2px solid ${getDaysSince(selectedPartner.last_interaction_at) >= 3 ? 'red' : '#000'}`, padding: '10px', background: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? '#ffe6e6' : '#f5f5f5' }}><span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', color: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? 'red' : '#000' }}>INAKTÍV NAPOK</span><span style={{ fontSize: '20px', fontWeight: 'bold', color: getDaysSince(selectedPartner.last_interaction_at) >= 3 ? 'red' : '#000' }}>{getDaysSince(selectedPartner.last_interaction_at)} NAP</span></div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleDeletePartner(selectedPartner.id)} style={{ padding: '10px', border: '2px solid red', background: 'transparent', color: 'red', fontWeight: 'bold', cursor: 'pointer' }}>TÖRLÉS</button>
                <button onClick={handleGhosting} style={{ padding: '15px 25px', background: 'red', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>☠️ ZOMBIE LEAD (Eltűnt)</button>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
             <div style={{ flex: '1 1 500px' }}>
                
                {/* 1. STÁTUSZ & MEGJEGYZÉS */}
                <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', background: '#f9f9f9' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>1. STÁTUSZVÁLTÁS ÉS FAL</h3>
                    <select value={selectedPartner.status} onChange={handleStatusChangeInit} style={{ width: '100%', padding: '15px', fontSize: '16px', border: '2px solid #000', fontWeight: 'bold', marginBottom: '10px' }}>{STATUSES.map(st => <option key={st} value={st}>{st}</option>)}</select>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="text" placeholder="Gyors megjegyzés a falra..." value={plainNote} onChange={(e) => setPlainNote(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #000' }}/>
                        <button onClick={handleAddPlainNote} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Rögzítés</button>
                    </div>
                </div>

                {/* 2. FELADATOK */}
                <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>2. KÖTELEZŐ FELADATOK</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                        <input type="text" placeholder="Új feladat..." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #000' }}/>
                        <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #000' }}/>
                        <button onClick={handleAddTask} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Hozzáad</button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {tasks.map(t => (
                            <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #000', marginBottom: '10px', background: (t.due_date < getTodayStr() && !t.is_completed) ? '#ffe6e6' : '#fff' }}>
                                <input type="checkbox" checked={t.is_completed} disabled={t.is_completed} onChange={() => completeTask(t.id)} style={{ transform: 'scale(1.5)', cursor: t.is_completed ? 'default' : 'pointer' }} />
                                <div><strong style={{ display: 'block', fontSize: '16px', textDecoration: t.is_completed ? 'line-through' : 'none', color: t.is_completed ? '#aaa' : '#000' }}>{t.description}</strong><span style={{ fontSize: '12px', color: (t.due_date < getTodayStr() && !t.is_completed) ? 'red' : '#000', fontWeight: 'bold' }}>HATÁRIDŐ: {t.due_date}</span></div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. EMAIL ÉS SABLONOK */}
                <div style={{ border: '2px solid #000', padding: '20px', marginBottom: '20px', background: '#f5f5f5' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>3. E-MAIL ÉS SABLONOK</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                        <select value={selectedTplId} onChange={(e) => { setSelectedTplId(e.target.value); setEditingTplId(null); }} style={{ flex: 1, padding: '10px', border: '1px solid #000' }}><option value="">Válassz sablont...</option>{emailTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
                        <button onClick={sendEmail} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✉ KÜLDÉS</button>
                        {selectedTplId && ( <button onClick={handleDeleteTemplate} style={{ padding: '10px 15px', background: 'red', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✖</button> )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="text" placeholder="Sablon neve" value={newTplTitle} onChange={e => setNewTplTitle(e.target.value)} style={{ padding: '8px', border: '1px solid #000' }}/>
                        <input type="text" placeholder="E-mail tárgya" value={newTplSubject} onChange={e => setNewTplSubject(e.target.value)} style={{ padding: '8px', border: '1px solid #000' }}/>
                        <textarea placeholder="Szöveg..." value={newTplBody} onChange={e => setNewTplBody(e.target.value)} style={{ padding: '8px', minHeight: '60px', border: '1px solid #000' }}></textarea>
                        <button onClick={handleSaveTemplate} style={{ padding: '10px', background: '#fff', border: '2px solid #000', fontWeight: 'bold', cursor: 'pointer' }}>ÚJ SABLON MENTÉSE</button>
                    </div>
                </div>

                {/* 4. DOKUMENTUMOK ÉS PLAYBOOK */}
                <div style={{ border: '2px solid #000', padding: '20px', background: '#fff' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>4. DOKUMENTUMOK</h3>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                        <input type="text" placeholder="Név..." value={newDocName} onChange={e => setNewDocName(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #000' }}/>
                        <input type="text" placeholder="URL Link..." value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #000' }}/>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => handleAddDocument('offer')} style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ AJÁNLAT</button>
                        <button onClick={() => handleAddDocument('contract')} style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ SZERZŐDÉS</button>
                        <button onClick={() => handleAddDocument('playbook')} style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ PLAYBOOK</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {['offer', 'contract', 'playbook'].map(type => (
                            <div key={type} style={{ border: '1px solid #000', padding: '10px' }}>
                                <strong style={{ textTransform: 'uppercase' }}>{type === 'offer' ? 'Ajánlat' : type === 'contract' ? 'Szerződés' : 'Playbook'}</strong>
                                <ul style={{ paddingLeft: '20px', margin: 0, marginTop: '10px', fontSize: '12px' }}>
                                    {documents.filter(d => d.doc_type === type).map(d => ( <li key={d.id}><a href={d.doc_url} target="_blank" rel="noreferrer" style={{ color: '#000', fontWeight: 'bold' }}>{d.doc_name}</a> <button onClick={() => handleDeleteDocument(d.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>✖</button></li> ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

             </div>
             
             {/* 5. TIMELINE */}
             <div style={{ flex: '1 1 400px', border: '2px solid #000', padding: '20px', background: '#fff' }}>
                 <h3 style={{ marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>INTERAKCIÓS NAPLÓ (MINDEN LÉPÉS)</h3>
                 {logs.map(l => (
                     <div key={l.id} style={{ borderBottom: '1px dashed #000', padding: '10px 0', background: l.action_type === 'LEJÁRT FELADAT' ? '#ffe6e6' : 'transparent' }}>
                         <strong style={{ fontSize: '12px', display: 'block', color: l.action_type === 'LEJÁRT FELADAT' ? 'red' : '#000' }}>{new Date(l.created_at).toLocaleString()} | {l.action_type}</strong>
                         <span style={{ fontSize: '14px' }}>{l.note}</span>
                     </div>
                 ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;