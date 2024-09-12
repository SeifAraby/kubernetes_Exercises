const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const winston = require('winston');
const LokiTransport = require('winston-loki');

const app = express();
const port = 3000;

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
        text VARCHAR(140) NOT NULL
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

initializeTodos();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

