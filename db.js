const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.pcmhyudzgxxhxkytelha:qInwiw-3byzgi-pansuw@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Váratlan hiba az adatbázis-kapcsolatban:', err);
});

console.log('Sikeresen csatlakozva a Supabase felhő adatbázishoz!');

module.exports = pool;