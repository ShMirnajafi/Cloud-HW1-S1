import { NextResponse } from 'next/server';
import { query } from '/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required.' }, { status: 400 });
    }

    const result = await query('SELECT * FROM images WHERE id = $1', [requestId]);
    if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
}
