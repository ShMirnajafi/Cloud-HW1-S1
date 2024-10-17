import amqp from 'amqplib';

const rabbitUrl = 'amqps://bpednnrj:1nD3uHw2DlfgF5dIR9nw2go5YVGYtwvO@jackal.rmq.cloudamqp.com/bpednnrj';

export const publishToQueue = async (queue, message) => {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

    setTimeout(() => {
        connection.close();
    }, 500);
};
