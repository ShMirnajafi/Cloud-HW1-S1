import amqp from 'amqplib';

export async function publishToQueue(queue, message) {
    try {
        const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to queue ${queue}:`, message);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error publishing to RabbitMQ queue:', error);
        throw error;
    }
}
