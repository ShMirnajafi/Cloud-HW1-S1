import { useEffect } from 'react';
import { connectRabbitMQ } from '../lib/rabbitmq';

export default function RootLayout({ children }) {
    useEffect(() => {
        connectRabbitMQ();
    }, []);

    return <>{children}</>;
}
