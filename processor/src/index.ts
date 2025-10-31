import {PrismaClient} from "../generated/prisma/client.js";
import {Kafka} from "kafkajs";
const client = new PrismaClient();

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["localhost:9092"]
});

const TOPIC_NAME = "zap-runs";

async function main(){
    const producer = kafka.producer();
    await producer.connect();

    while(1){
        const outboxItems = await client.zapRunOutbox.findMany({
            take: 10,
            where: { }
        });

           producer.send({
            topic: TOPIC_NAME,
            messages: outboxItems.map(r => {
                return {
                    value: r.zapRunId,
                };
            }),
        });

        await client.zapRunOutbox.deleteMany({
            where: {
                id: { in: outboxItems.map(i => i.id) }
            }
        });
    }
}

main();