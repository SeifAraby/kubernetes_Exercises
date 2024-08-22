const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

const filePath = '/shared/timestamp.txt';

const hashContent = (content) => {
    return crypto.createHash('sha256').update(content).digest('hex');
};

app.get('/status', (req, res) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8').trim();
        const [timestamp, randomString] = content.split('\n');
        res.json({
            timestamp: timestamp,
            randomString: randomString,
            hash: hashContent(content)
        });
    } catch (err) {
        res.status(500).send('Error reading file');
    }
});

app.listen(port, () => {
    console.log(`Timestamp reader running on port ${port}`);
});
