import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

export const ensureTableExists = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        new_image_url TEXT,
        image_url TEXT,
        image_caption TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
  `;

    try {
        await sql(createTableQuery);
        console.log('Requests table is ready.');
    } catch (error) {
        console.error('Error creating requests table:', error);
        throw error;
    }
};
