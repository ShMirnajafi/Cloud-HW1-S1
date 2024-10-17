import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/utils/s3';
import { query } from '@/utils/db';
import { publishToQueue } from '@/utils/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { email, image } = await req.json();
        if (!email || !image) {
            return NextResponse.json({ error: 'Email and image are required' }, { status: 400 });
        }

        // Generate unique filename
        const fileName = `${uuidv4()}.jpg`;

        // Upload image to object storage
        const imageBuffer = Buffer.from(image, 'base64');
        const s3Response = await uploadToS3(imageBuffer, fileName);
        const imageUrl = s3Response.Location;

        // Save request info in PostgreSQL
        const result = await query(
            'INSERT INTO requests (email, status, image_url) VALUES ($1, $2, $3) RETURNING id',
            [email, 'pending', imageUrl]
        );
        const requestId = result.rows[0].id;

        // Send message to RabbitMQ queue for further processing
        await publishToQueue('image_processing', { requestId, imageUrl });

        return NextResponse.json({ requestId, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
