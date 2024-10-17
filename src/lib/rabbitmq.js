import amqp from 'amqplib';

const rabbitUrl = process.env.CLOUDAMQP_URL;

export const publishToQueue = async (queue, message) => {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

    setTimeout(() => {
        connection.close();
    }, 500);
};
