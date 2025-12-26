import fs from 'fs';
import path from 'path';
import pool from './db.js';

const runSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
};

export const initDatabase = async () => {
  try {
    console.log('Running database migrations...');


const migrationsDir = path.resolve('database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      await runSqlFile(path.join(migrationsDir, file));
    }

    console.log('Running database seeds...');


    const seedFile = path.resolve('database/seeds/seed_data.sql');
    await runSqlFile(seedFile);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};
