import { neon } from "@neondatabase/serverless";

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Function to get the request status by ID
export const getRequestStatusById = async (id) => {
    try {
        const result = await sql`
      SELECT status, new_image_url 
      FROM requests 
      WHERE id = ${id}
    `;

        if (result.length === 0) {
            return null;
        }

        return result[0];
    } catch (error) {
        console.error('Error fetching request status:', error);
        throw error;
    }
};

// Function to ensure the requests table exists
export const ensureTableExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            new_image_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
            );
    `;

    try {
        // Create the table if it doesn't exist
        await sql(createTableQuery);
        console.log('Requests table is ready.');
    } catch (error) {
        console.error('Error creating requests table:', error);
        throw error;
    }
};
