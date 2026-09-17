const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

console.log("--> FIGYELEM: EZ A FRISSITETT SERVER.JS FUT (DINAMIKUS FELADATOKKAL)!");

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
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, manager } = req.body;

        const newPartner = await pool.query(
            `INSERT INTO partners 
            (company_name, contact_person, phone, email, revenue, tax_number, billing_address, status, manager) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
              company_name, 
              contact_person, 
              phone, 
              email || '', 
              revenue || '', 
              tax_number || '', 
              billing_address || '', 
              '1. Új lead',
              manager || ''
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
        const { company_name, contact_person, phone, email, revenue, tax_number, billing_address, status, manager } = req.body;

        const updatedPartner = await pool.query(
            `UPDATE partners 
             SET company_name = $1, contact_person = $2, phone = $3, email = $4, revenue = $5, tax_number = $6, billing_address = $7, status = $8, manager = $9
             WHERE id = $10 RETURNING *`,
            [company_name, contact_person, phone, email || '', revenue || '', tax_number || '', billing_address || '', status, manager || '', id]
        );

        if (updatedPartner.rows.length === 0) {
            return res.status(404).json({ error: 'A partner nem található.' });
        }

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

// 5. Feladatok lekérdezése
app.get('/api/partners/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await pool.query('SELECT * FROM tasks WHERE partner_id = $1 ORDER BY id ASC', [id]);
        res.json(tasks.rows);
    } catch (err) {
        console.error('Hiba feladatok lekérésekor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. Új feladat kiírása
app.post('/api/partners/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        
        const newTask = await pool.query(
            'INSERT INTO tasks (partner_id, description) VALUES ($1, $2) RETURNING *',
            [id, description]
        );

        await pool.query(
            'INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)',
            [id, 'Admin', 'ÚJ FELADAT', `Kiosztott feladat: ${description}`]
        );
        
        res.json(newTask.rows[0]);
    } catch (err) {
        console.error('Hiba feladat kiírásakor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 7. Feladat végleges lezárása
app.put('/api/partners/:partnerId/tasks/:taskId/complete', async (req, res) => {
    try {
        const { partnerId, taskId } = req.params;
        
        const updatedTask = await pool.query(
            'UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *',
            [taskId]
        );

        if (updatedTask.rows.length > 0) {
            const taskDesc = updatedTask.rows[0].description;
            await pool.query(
                'INSERT INTO audit_logs (partner_id, user_name, action_type, note) VALUES ($1, $2, $3, $4)',
                [partnerId, 'Admin', 'FELADAT KÉSZ', `Feladat lezárva: ${taskDesc}`]
            );
        }

        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error('Hiba a feladat lezárásakor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 8. Logok lekérdezése
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

// 9. Megjegyzés rögzítése
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

// 10. Partner törlése
app.delete('/api/partners/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE partner_id = $1', [id]);
        await pool.query('DELETE FROM partners WHERE id = $1', [id]);
        res.json({ message: 'Partner és a hozzá tartozó adatok törölve.' });
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
  
  -- Régi feladat oszlopokat megtartjuk, hogy ne törjön el az adatbázis, de már nem ezt használjuk
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS task TEXT;
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS task_completed BOOLEAN DEFAULT false;

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    partner_id INT,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
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
`).then(() => {
  console.log("✔ Adatbázis sémák (Tasks táblával) sikeresen frissítve.");
}).catch(err => {
  console.error("❌ Hiba az adatbázis sémák frissítésekor:", err);
});