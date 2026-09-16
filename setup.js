const pool = require('./db');

async function resetDatabase() {
  try {
    console.log("Táblák újrahúzása a kibővített adatbázis mezőkkel...");
    await pool.query(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS partners CASCADE;`);

    await pool.query(`
      CREATE TABLE partners (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        revenue VARCHAR(100),
        tax_number VARCHAR(100),
        billing_address TEXT,
        status VARCHAR(100) DEFAULT '1. Új',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        action_type VARCHAR(50),
        old_status VARCHAR(100),
        new_status VARCHAR(100),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Siker: Adatbázis a 12 státusszal és új mezőkkel beállítva!");
    process.exit(0);
  } catch (err) {
    console.error("Hiba az adatbázis beállításakor:", err);
    process.exit(1);
  }
}

resetDatabase();