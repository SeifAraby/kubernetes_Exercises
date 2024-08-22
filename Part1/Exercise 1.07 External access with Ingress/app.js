const express = require('express');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

let timestamp;
let randomString;

const updateStatus = () => {
    timestamp = new Date().toISOString();
    randomString = crypto.randomUUID();
    console.log(`${timestamp}: ${randomString}`);
};

setInterval(updateStatus, 5000);

app.get('/status', (req, res) => {
    res.json({
        timestamp: timestamp,
        randomString: randomString
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

