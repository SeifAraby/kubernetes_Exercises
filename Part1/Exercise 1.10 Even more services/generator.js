const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

const filePath = '/shared/timestamp.txt';

const ensureFileExists = () => {
    try {
        fs.openSync(filePath, 'a');
    } catch (err) {
        console.error(`Error creating file: ${err.message}`);
    }
};

ensureFileExists();

const updateStatus = () => {
    const timestamp = new Date().toISOString();
    const data = `${timestamp}`;

    try {
        fs.writeFileSync(filePath, data);
        console.log(`Updated file with: ${data}`);
    } catch (err) {
        console.error(`Error writing to file: ${err.message}`);
    }
};

setInterval(updateStatus, 5000);

app.listen(port, () => {
    console.log(`Timestamp generator running on port ${port}`);
});
