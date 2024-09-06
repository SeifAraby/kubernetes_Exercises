const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pingPongServiceUrl = 'http://ping-pong-service:3000/';

const message = process.env.MESSAGE || 'configmap does not work';
const filePath = path.join(__dirname, 'config/information.txt');
let fileContent = 'File not found';
if (fs.existsSync(filePath)) {
  fileContent = fs.readFileSync(filePath, 'utf-8');
}

const updateStatus = async () => {
    const timestamp = new Date().toISOString();
    const randomString = crypto.randomUUID();

    let pingPongCount = '0';
    try {
        const response = await axios.get(pingPongServiceUrl);
        pingPongCount = response.data.match(/\d+/)[0];
    } catch (error) {
        console.error('Error fetching ping-pong count:', error.message);
    }

    const data = `${timestamp}: ${randomString}\nPing / Pongs: ${pingPongCount}\n`;
    console.log(`Updated data: ${data}`);
    console.log(`File content: ${fileContent}`);
    console.log(`Env variable: MESSAGE=${message}`);
};

const respondWithStatus = (req, res) => {
    const timestamp = new Date().toISOString();
    const randomString = crypto.randomUUID();
    let pingPongCount = '0';

    axios.get(pingPongServiceUrl)
        .then(response => {
            pingPongCount = response.data.match(/\d+/)[0];
            const data = `${timestamp}: ${randomString}.\nPing / Pongs: ${pingPongCount}\n`;
            res.send(`${data}\nFile content: ${fileContent}\nEnv variable: MESSAGE=${message}`);
        })
        .catch(error => {
            console.error('Error fetching ping-pong count:', error.message);
            res.status(500).send('Error fetching ping-pong count');
        });
};

app.get('/status', respondWithStatus);
app.get('/', respondWithStatus);

setInterval(updateStatus, 5000);

app.listen(port, () => {
    console.log(`Timestamp generator running on port ${port}`);
});

