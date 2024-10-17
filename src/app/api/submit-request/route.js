import { NextResponse } from 'next/server';
import { ensureTableExists } from '@/lib/db';
import { publishToQueue } from '@/lib/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { email, image } = await req.json();

        if (!email || !image) {
            return NextResponse.json({ error: 'Email and image are required' }, { status: 400 });
        }

        // Ensure table exists
        await ensureTableExists();

        // Insert request into Neon DB without image_url
        const result = await sql`
      INSERT INTO requests (email, status) 
      VALUES (${email}, 'pending') 
      RETURNING id
    `;
        const requestId = result[0].id;

        // Send image and request ID to RabbitMQ for further processing
        await publishToQueue('image_processing', { requestId, image });

        return NextResponse.json({ requestId, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
