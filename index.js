const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const cors = require('cors');

app.use(express.json());
const port = process.env.PORT || 1337;

const allowedOrigins = [process.env.ORIGIN_1, process.env.ORIGIN_2, process.env.ORIGIN_3, process.env.ORIGIN_4];

app.use(cors({
    origin: (origin, callback) => {
        // Check if the origin is in the allowed list or if it's not provided (e.g., for same-origin requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get('/record/getall', async (req, res) => {
    try {
        const records = await prisma.record.findMany();
        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post('/record/add', async (req, res) => {
    const { userName } = req.body;
    try {
        const record = await prisma.record.upsert({
            where: { userName },
            update: {
                lastMatch: new Date(),
                totalWins: {
                    increment: 1
                }
            },
            create: {
                userName,
                totalWins: 1,
            }
        });
        return res.status(200).json(record);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
