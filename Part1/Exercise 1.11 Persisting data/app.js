const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

const filePath = '/shared/timestamp.txt';
const pingPongPath = '/shared/pingpong.txt';

const updateStatus = () => {
    const timestamp = new Date().toISOString();
    const randomString = crypto.randomUUID();

    const pingPongCount = fs.existsSync(pingPongPath) ? fs.readFileSync(pingPongPath, 'utf8').trim() : '0';

    const data = `${timestamp}: ${randomString}\nPing / Pongs: ${pingPongCount}\n`;
    fs.writeFileSync(filePath, data);
    console.log(`Updated file with: ${data}`);
};

const respondWithStatus = (req, res) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        res.send(data);
    } else {
        res.status(404).send('No data available');
    }
};

app.get('/status', respondWithStatus);

app.get('/', respondWithStatus);

setInterval(updateStatus, 5000);

app.listen(port, () => {
    console.log(`Timestamp generator running on port ${port}`);
});
