import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    channel = await connection.createChannel();
};

export const sendToQueue = (queue, message) => {
    if (channel) {
        channel.sendToQueue(queue, Buffer.from(message));
    }
};
