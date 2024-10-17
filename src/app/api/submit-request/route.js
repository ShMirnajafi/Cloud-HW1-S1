import { NextResponse } from 'next/server';
import { ensureTableExists, sql } from '@/lib/db';
import { publishToQueue } from '@/lib/rabbitmq';
import { uploadFile } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const formData = await req.formData();

        const email = formData.get('email');
        const imageFile = formData.get('image');

        if (!email || !imageFile) {
            return NextResponse.json({ error: 'Email and image are required' }, { status: 400 });
        }

        // Convert the image file to a buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate a unique filename for the uploaded image
        const fileName = `${uuidv4()}_${imageFile.name}`;

        // Upload the image to Liara Object Storage using s3.js
        const imageUrl = await uploadFile(fileName, buffer);

        // Ensure the table exists in the database
        await ensureTableExists();

        // Insert the request into the database
        const result = await sql`
      INSERT INTO requests (email, status, image_url) 
      VALUES (${email}, 'pending', ${imageUrl}) 
      RETURNING id
    `;
        const requestId = result[0].id;

        // Send the image and request ID to RabbitMQ for further processing
        await publishToQueue('image_processing', { requestId, image: buffer });

        return NextResponse.json({ requestId, message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
    }
}
