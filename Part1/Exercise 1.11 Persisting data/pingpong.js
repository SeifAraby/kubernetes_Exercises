const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const filePath = '/shared/pingpong.txt';

const updatePingPong = () => {
    let count = 0;
    if (fs.existsSync(filePath)) {
        count = parseInt(fs.readFileSync(filePath, 'utf8').trim(), 10);
    }
    count += 1;
    fs.writeFileSync(filePath, count.toString());
    console.log(`Ping/Pong count updated to: ${count}`);
};

const respondWithPingPong = (req, res) => {
    if (fs.existsSync(filePath)) {
        const count = fs.readFileSync(filePath, 'utf8').trim();
        res.send(`Ping / Pongs: ${count}`);
    } else {
        res.send('Ping / Pongs: 0');
    }
};

app.get('/pingpong', (req, res) => {
    updatePingPong();
    respondWithPingPong(req, res);
});

app.get('/', (req, res) => {
    updatePingPong();
    respondWithPingPong(req, res);
});

app.listen(port, () => {
    console.log(`Ping-pong app running on port ${port}`);
});

