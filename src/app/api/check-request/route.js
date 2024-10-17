import { NextResponse } from 'next/server';
import { getRequestStatusById } from '@/utils/db';

export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
        }

        // Retrieve the status and new_image_url from the database
        const requestStatus = await getRequestStatusById(id);

        if (!requestStatus) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const { status, new_image_url } = requestStatus;

        // Return the status and, if available, the new image URL
        return NextResponse.json({
            status,
            newImageUrl: status === 'done' ? new_image_url : null,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
