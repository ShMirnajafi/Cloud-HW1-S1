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

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = `${uuidv4()}_${imageFile.name}`;

        const imageUrl = await uploadFile(fileName, buffer);

        await ensureTableExists();

        const result = await sql`
      INSERT INTO requests (email, status, image_url) 
      VALUES (${email}, 'pending', ${imageUrl}) 
      RETURNING id
    `;
        const requestId = result[0].id;

        await publishToQueue('image_processing', { requestId, imageUrl });

        return NextResponse.json({ requestId, message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
    }
}
