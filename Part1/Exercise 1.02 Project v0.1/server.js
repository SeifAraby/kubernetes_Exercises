const express = require('express');
const app = express();

const port = process.env.PORT || 4173;

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

