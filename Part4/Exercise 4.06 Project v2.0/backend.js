const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const winston = require('winston');
const LokiTransport = require('winston-loki');
const { connect, StringCodec } = require('nats');

const app = express();
const port = 3000;

const natsUrl = process.env.NATS_URL || 'nats://my-nats.default.svc.cluster.local:4222';
let natsClient;
const stringCodec = StringCodec();

// Asynchronous NATS connection setup
(async () => {
  try {
    natsClient = await connect({ servers: natsUrl });
    console.log('Connected to NATS server');

    // Correct error handling method
    natsClient.closed().then(() => {
      console.error('NATS connection closed');
    }).catch((err) => {
      console.error('NATS connection error:', err);
    });

  } catch (err) {
    console.error('Error connecting to NATS:', err.message);
    process.exit(1); // Exit if unable to connect to NATS
  }
})();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const lokiUrl = process.env.LOKI_URL || 'http://loki.loki-stack:3100';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new LokiTransport({
      host: lokiUrl,
      labels: { job: 'todo-backend' },
    }),
  ],
});

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`, { method: req.method, url: req.url });
  next();
});

const initializeTodos = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL,
        done BOOLEAN DEFAULT FALSE
      )
    `);
  } catch (err) {
    logger.error('Error initializing todos table', { error: err.message });
  }
};

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('OK');
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(500).send('Database connection failed');
  }
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json({ todos: result.rows });
  } catch (err) {
    logger.error('Error fetching todos', { error: err.message });
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

app.post('/', async (req, res) => {
  const todoText = req.body.todo;

  if (todoText && todoText.length <= 140) {
    try {
      await pool.query('INSERT INTO todos (text) VALUES ($1)', [todoText]);
      const result = await pool.query('SELECT * FROM todos');
      res.json({ success: true, todos: result.rows });
    } catch (err) {
      logger.error('Error saving todo', { error: err.message });
      res.status(500).json({ success: false, message: 'Error saving todo' });
    }
  } else {
    const errorMessage = `Todo must be 140 characters or less. Provided length: ${todoText.length}`;
    logger.warn('Invalid todo length', { message: errorMessage, todoText });
    res.json({ success: false, message: errorMessage });
  }
});

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json({ todos: result.rows });
  } catch (err) {
    logger.error('Error fetching todos', { error: err.message });
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

app.post('/todos', async (req, res) => {
  const todoText = req.body.todo;

  if (todoText && todoText.length <= 140) {
    try {
      await pool.query('INSERT INTO todos (text) VALUES ($1)', [todoText]);
      const result = await pool.query('SELECT * FROM todos');
      res.json({ success: true, todos: result.rows });
    } catch (err) {
      logger.error('Error saving todo', { error: err.message });
      res.status(500).json({ success: false, message: 'Error saving todo' });
    }
  } else {
    const errorMessage = `Todo must be 140 characters or less. Provided length: ${todoText.length}`;
    logger.warn('Invalid todo length', { message: errorMessage, todoText });
    res.json({ success: false, message: errorMessage });
  }
});

app.patch('/', async (req, res) => {
  const { id, done } = req.body;

  if (!id || typeof done !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    await pool.query('UPDATE todos SET done = $1 WHERE id = $2', [done, id]);

    // Publish a message to NATS
    const message = JSON.stringify({ id, done });
    console.log(`Publishing to NATS: ${message}`);
    natsClient.publish('todo.status.updated', stringCodec.encode(message));

    const result = await pool.query('SELECT * FROM todos');
    res.json({ success: true, todos: result.rows });
  } catch (err) {
    logger.error('Error updating todo status', { error: err.message });
    res.status(500).json({ success: false, message: 'Error updating todo status' });
  }
});

app.patch('/status', async (req, res) => {
  const { id, done } = req.body;

  if (!id || typeof done !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }

  try {
    await pool.query('UPDATE todos SET done = $1 WHERE id = $2', [done, id]);

    // Publish a message to NATS
    const message = JSON.stringify({ id, done });
    console.log(`Publishing to NATS: ${message}`);
    natsClient.publish('todo.status.updated', stringCodec.encode(message));


    const result = await pool.query('SELECT * FROM todos');
    res.json({ success: true, todos: result.rows });
  } catch (err) {
    logger.error('Error updating todo status', { error: err.message });
    res.status(500).json({ success: false, message: 'Error updating todo status' });
  }
});

initializeTodos();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
