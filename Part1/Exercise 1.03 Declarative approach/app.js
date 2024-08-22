const crypto = require('crypto');
const randomString = crypto.randomUUID();

const logString = () => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${randomString}`);
};

setInterval(logString, 5000);

