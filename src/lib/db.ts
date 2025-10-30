import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Required for Azure DB connections
  }
});

export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  const result = await query(
    'SELECT * FROM bruker WHERE navn = $1',
    [username]
  );
  return result.rows[0];
}

export async function getUserById(id: number) {
  const result = await query(
    'SELECT * FROM bruker WHERE bruker_id = $1',
    [id]
  );
  return result.rows[0];
}