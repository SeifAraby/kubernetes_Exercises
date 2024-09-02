const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// In-memory list of todos
let todos = ["TODO 1", "TODO 2"];

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Endpoint to get all todos
app.get('/todos', (req, res) => {
    res.json({ todos });
});

// Endpoint to create a new todo
app.post('/todos', (req, res) => {
    const todoText = req.body.todo;

    if (todoText && todoText.length <= 140) {
        todos.push(todoText);
        res.json({ success: true, todos });
    } else {
        res.json({ success: false, message: 'Todo must be 140 characters or less.' });
    }
});

app.get('/', (req, res) => {
    res.json({ todos });
});

app.post('/', (req, res) => {
    const todoText = req.body.todo;

    if (todoText && todoText.length <= 140) {
        todos.push(todoText);
        res.json({ success: true, todos });
    } else {
        res.json({ success: false, message: 'Todo must be 140 characters or less.' });
    }
});


// Endpoint to handle preflight requests (if needed)
app.options('/todos', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
});

app.options('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
