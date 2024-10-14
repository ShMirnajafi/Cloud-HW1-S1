import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import amqp from 'amqplib';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const upload = multer({ dest: 'uploads/' });

export const POST = async (req) => {
    return new Promise((resolve, reject) => {
        upload.single('image')(req, {}, async (err) => {
            if (err) {
                return resolve(NextResponse.json({ error: 'File upload failed' }, { status: 500 }));
            }

            const { email } = req.body;
            const file = req.file;

            if (!file) {
                return resolve(NextResponse.json({ error: 'No image file provided' }, { status: 400 }));
            }

            const requestId = uuidv4();

            try {
                // Save request to PostgreSQL
                const client = await pool.connect();
                await client.query(
                    `INSERT INTO requests (id, email, status) VALUES ($1, $2, 'pending')`,
                    [requestId, email]
                );
                client.release();

                // Queue the request for processing in RabbitMQ
                const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
                const channel = await connection.createChannel();
                await channel.assertQueue('image_processing_queue', { durable: true });
                await channel.sendToQueue('image_processing_queue', Buffer.from(JSON.stringify({ requestId, file })));

                resolve(NextResponse.json({ requestId }, { status: 201 }));
            } catch (err) {
                console.error(err);
                resolve(NextResponse.json({ error: 'Failed to process request' }, { status: 500 }));
            }
        });
    });
};
