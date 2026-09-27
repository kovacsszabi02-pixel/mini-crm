const { Pool } = require('pg');

// Illeszd be a Supabase-ről kimásolt connection stringet az alábbi idézőjelek közé:
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ecijkxgadxijogykiycc:qInwiw-3byzgi-pansuw@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: connectionString.trim(),
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;