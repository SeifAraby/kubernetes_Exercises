const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

let pingPongCount = 0;

const updatePingPong = () => {
    pingPongCount += 1;
    console.log(`Ping/Pong count updated to: ${pingPongCount}`);
};
app.get('/', (req, res) => {
    updatePingPong();
    res.send(`Ping / Pongs: ${pingPongCount}`);
});
app.get('/pingpong', (req, res) => {
    updatePingPong();
    res.send(`Ping / Pongs: ${pingPongCount}`);
});

app.listen(port, () => {
    console.log(`Ping-pong app running on port ${port}`);
});
