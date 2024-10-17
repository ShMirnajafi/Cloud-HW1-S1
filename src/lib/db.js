import { Pool } from 'pg';

// Initialize the connection pool for PostgreSQL
const pool = new Pool({
    connectionString: 'postgresql://root:1XnDUzIV9NcLoBoTsXp7avSN@request:5432/postgres',
});

// Generic query function to use across the app
export const query = (text, params) => pool.query(text, params);

// Function to ensure the requests table exists
export const ensureTableExists = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      image_url TEXT NOT NULL,
      new_image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

    try {
        // Execute the table creation query
        await query(createTableQuery);
        console.log('Requests table is ready.');
    } catch (error) {
        console.error('Error creating requests table:', error);
        throw error;
    }
};

// Function to get the request status by ID
export const getRequestStatusById = async (id) => {
    try {
        const result = await query('SELECT status, new_image_url FROM requests WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error fetching request status:', error);
        throw error;
    }
};

// Call ensureTableExists to make sure the table is ready
ensureTableExists();
