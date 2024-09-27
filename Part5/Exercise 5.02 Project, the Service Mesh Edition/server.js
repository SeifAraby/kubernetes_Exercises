const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

const assetsDir = path.join(__dirname, 'shared');
const imagePath = path.join(assetsDir, 'image.jpg');

let todos = ['TODO 1', 'TODO 2'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

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

app.use('/shared', express.static(assetsDir));

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Todo-app server started on port ${port}`);
});

