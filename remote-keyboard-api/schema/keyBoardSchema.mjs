import mysql from 'mysql2/promise';

const DB_NAME = process.env.DB_NAME;

async function initDatabaseAndSchema() {
  if (!DB_NAME) {
    throw new Error(
      "Database name (DB_NAME) is not defined in environment variables"
    );
  }
  
  try {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    // Create database if not exists
    await connection.query(`
        CREATE DATABASE IF NOT EXISTS ${DB_NAME}
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
      `);

    console.log(`Database '${DB_NAME}' is ready`);

    // Switch to database
    await connection.query(`USE ${DB_NAME}`);

    // Create keyboard_keys table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS keyboard_keys (
          key_id INT PRIMARY KEY,
          is_lit BOOLEAN NOT NULL DEFAULT FALSE,
          lit_by INT NULL,
          color INT NULL DEFAULT 1,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP
        )
      `);

    // Create keyboard_control table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS keyboard_control (
          id INT PRIMARY KEY AUTO_INCREMENT,
          acquired_by INT NULL,
          acquired_on TIMESTAMP NULL
        )
      `);

    await connection.query(`
        INSERT IGNORE INTO keyboard_control (id, acquired_by, acquired_on)
        VALUES (1, NULL, NULL)
    `);
    
    console.log("Tables are ready");

    // Check if keyboard keys already exist
    const [[{ count }]] = await connection.query(`
        SELECT COUNT(*) AS count FROM keyboard_keys
    `);

    // Seed keys only if table is empty
    if (count === 0) {
        await connection.query(`
        INSERT INTO keyboard_keys (key_id)
        VALUES
            (1),(2),(3),(4),(5),
            (6),(7),(8),(9),(10)
        `);

        console.log('Keyboard keys seeded (1–10)');
    } else {
        console.log('Keyboard keys already exist');
    }


    await connection.end();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

export default initDatabaseAndSchema;