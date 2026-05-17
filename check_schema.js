const fs = require('fs');
try {
  const path = require('path');
  require('dotenv').config({ path: 'C:/Users/Tsega DESIRE BADOLA/Desktop/map-backend/.env' });
  const { Pool } = require('C:/Users/Tsega DESIRE BADOLA/Desktop/map-backend/node_modules/pg');

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('departments', 'staff', 'rooms');
  `).then(res => {
    fs.writeFileSync('schema_output.log', JSON.stringify(res.rows, null, 2));
    pool.end();
  }).catch(err => {
    fs.writeFileSync('schema_output.log', "QUERY ERROR: " + err);
    pool.end();
  });

} catch(err) {
  fs.writeFileSync('schema_output.log', "REQUIRE ERROR: " + err);
}
