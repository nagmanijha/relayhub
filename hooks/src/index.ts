import express from "express"
import { PrismaClient, Prisma } from "../generated/prisma/client.js";
const app = express();
import "dotenv/config";

const client = new PrismaClient();

console.log("Hooks service started");
app.use(express.json());
//some password logic
app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    console.log("Received hook for user:", userId, "zap:", zapId, "with body:", body);
    //store in db a new trigger

    await client.$transaction(async (tx: Prisma.TransactionClient) => {
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body,
            },
    })
        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            },
});
       res.json({
        message: "Hook received and zap run created",
       })
    });
    //push it in a queue(kafka, redis)
    
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});