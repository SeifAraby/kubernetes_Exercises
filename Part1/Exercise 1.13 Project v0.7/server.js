const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

const imagePath = path.join('/shared', 'image.jpg');
let todos = ['TODO 1', 'TODO 2'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const downloadImage = () => {
    const command = `wget -O ${imagePath} https://picsum.photos/1200`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading the image: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`wget stderr: ${stderr}`);
            return;
        }
        console.log(`Downloaded new image successfully.`);
    });
};

if (!fs.existsSync(imagePath) || (Date.now() - fs.statSync(imagePath).mtimeMs) > 60 * 60 * 1000) {
    downloadImage();
}

setInterval(downloadImage, 60 * 60 * 1000);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/shared', express.static('/shared'));

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const { todo } = req.body;
    if (todo && todo.length <= 140) {
        todos.push(todo);
        res.json({ success: true, todos });
    } else {
        res.json({ success: false, message: 'Todo must be 140 characters or less.' });
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

