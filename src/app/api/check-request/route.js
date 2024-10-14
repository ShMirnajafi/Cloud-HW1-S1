import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
        return NextResponse.json({ error: 'Request ID not provided' }, { status: 400 });
    }

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT status, new_image_url FROM requests WHERE id = $1', [requestId]);
        client.release();

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const { status, new_image_url } = res.rows[0];
        return NextResponse.json({ status, newImageUrl: new_image_url }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
};
