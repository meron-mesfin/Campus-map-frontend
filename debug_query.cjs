const fs = require('fs');

function log(msg) {
  fs.appendFileSync('debug_query.log', msg + '\n');
}

// Clear log
fs.writeFileSync('debug_query.log', '=== Debug Query Start ===\n');

try {
  log("1. Loading dotenv from backend...");
  const dotenvPath = 'c:/Users/Tsega DESIRE BADOLA/Desktop/map-backend/node_modules/dotenv';
  const dotenv = require(dotenvPath);
  dotenv.config({ path: 'c:/Users/Tsega DESIRE BADOLA/Desktop/map-backend/.env' });
  
  log(`DB_USER: ${process.env.DB_USER}`);
  log(`DB_HOST: ${process.env.DB_HOST}`);
  log(`DB_NAME: ${process.env.DB_NAME}`);
  
  log("2. Requiring pg from backend...");
  const pgPath = 'c:/Users/Tsega DESIRE BADOLA/Desktop/map-backend/node_modules/pg';
  const { Pool } = require(pgPath);
  
  log("3. Initializing Pool...");
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
  log("4. Running query...");
  const query = `
    SELECT 
      d.id::text,
      d.name,
      d.description,
      d.phone,
      d.email,
      d.building_id::text,
      b.name as building_name,
      (SELECT COUNT(*)::int FROM staff s WHERE s.department_id::text = d.id::text) as staff_count,
      (SELECT COUNT(*)::int FROM rooms r WHERE r.department_id::text = d.id::text) as room_count
    FROM departments d 
    LEFT JOIN buildings b ON d.building_id = b.id 
    ORDER BY d.name ASC
  `;
  
  pool.query(query)
    .then(res => {
      log(`5. Success! Returned ${res.rows.length} rows.`);
      log(JSON.stringify(res.rows, null, 2));
      pool.end().then(() => {
        log("Pool closed.");
        process.exit(0);
      });
    })
    .catch(err => {
      log("❌ Query Error: " + err.message);
      log(err.stack);
      pool.end().then(() => {
        log("Pool closed after error.");
        process.exit(1);
      });
    });
} catch (e) {
  log("❌ Fatal Script Error: " + e.message);
  log(e.stack);
  process.exit(1);
}
