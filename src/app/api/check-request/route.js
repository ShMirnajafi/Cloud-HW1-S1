import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const id = formData.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
        }

        const result = await sql`
            SELECT status, new_image_url
            FROM requests
            WHERE id = ${id}
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const { status, new_image_url } = result[0];

        return NextResponse.json({
            status,
            newImageUrl: status === 'done' ? new_image_url : null,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
