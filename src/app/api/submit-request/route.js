import { NextResponse } from 'next/server';
import { query } from '/lib/db.js'
import { uploadImage } from '/lib/storage.js';
import { sendToQueue } from '/lib/rabbitmq.js';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('image');
    const email = formData.get('email');

    if (!file || !email) {
        return NextResponse.json({ error: 'Image and email are required.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;

    // Step 1: Upload to Object Storage
    const imageUrl = await uploadImage(fileBuffer, fileName);
    if (!imageUrl) {
        return NextResponse.json({ error: 'Failed to store image.' }, { status: 500 });
    }

    // Step 2: Save to Database
    const result = await query(
        'INSERT INTO images (email, status) VALUES ($1, $2) RETURNING id',
        [email, imageUrl, 'pending']
    );

    const requestId = result.rows[0].id;

    // Step 3: Send to RabbitMQ for processing
    sendToQueue('image_processing_queue', JSON.stringify({ requestId }));

    return NextResponse.json({ message: 'Request registered!', requestId });
}
