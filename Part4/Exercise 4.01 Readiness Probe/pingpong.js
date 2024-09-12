const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.PGUSER || 'pingponguser',
    host: process.env.PGHOST || 'postgres-service',
    database: process.env.PGDATABASE || 'pingpongdb',
    password: process.env.PGPASSWORD || 'pingpongpass',
    port: 5432,
});

const initializePingPongCount = async () => {
    try {
        await pool.query('CREATE TABLE IF NOT EXISTS pingpong (count INT)');
        const res = await pool.query('SELECT count FROM pingpong');
        if (res.rows.length === 0) {
            await pool.query('INSERT INTO pingpong (count) VALUES (0)');
        }
    } catch (err) {
        console.error('Error initializing ping-pong count:', err);
        process.exit(1);
    }
};

const updatePingPong = async () => {
    try {
        const res = await pool.query('SELECT count FROM pingpong');
        let pingPongCount = res.rows[0].count + 1;
        await pool.query('UPDATE pingpong SET count = $1', [pingPongCount]);
        console.log(`Ping/Pong count updated to: ${pingPongCount}`);
        return pingPongCount;
    } catch (err) {
        console.error('Error updating ping-pong count:', err);
        return 0;
    }
};

app.get('/healthz', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).send('OK');
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).send('Database connection failed');
    }
});

app.get('/', async (req, res) => {
    const pingPongCount = await updatePingPong();
    res.send(`Ping / Pongs: ${pingPongCount}`);
});

app.get('/pingpong', async (req, res) => {
    const pingPongCount = await updatePingPong();
    res.send(`Ping / Pongs: ${pingPongCount}`);
});

initializePingPongCount();

app.listen(port, () => {
    console.log(`Ping-pong app running on port ${port}`);
});

