const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Use DATABASE_URL directly
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(bodyParser.json());
app.use(cors());

const initializeTodos = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL
      )
    `);
  } catch (err) {
    console.error('Error initializing todos table:', err);
  }
};

// Endpoint to get all todos
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json({ todos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// Endpoint to create a new todo
app.post('/', async (req, res) => {
  const todoText = req.body.todo;

  if (todoText && todoText.length <= 140) {
    try {
      await pool.query('INSERT INTO todos (text) VALUES ($1)', [todoText]);
      const result = await pool.query('SELECT * FROM todos');
      res.json({ success: true, todos: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error saving todo' });
    }
  } else {
    res.json({ success: false, message: 'Todo must be 140 characters or less.' });
  }
});

// Alternative endpoint to get all todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json({ todos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// Alternative endpoint to create a new todo
app.post('/todos', async (req, res) => {
  const todoText = req.body.todo;

  if (todoText && todoText.length <= 140) {
    try {
      await pool.query('INSERT INTO todos (text) VALUES ($1)', [todoText]);
      const result = await pool.query('SELECT * FROM todos');
      res.json({ success: true, todos: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error saving todo' });
    }
  } else {
    res.json({ success: false, message: 'Todo must be 140 characters or less.' });
  }
});

initializeTodos();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
