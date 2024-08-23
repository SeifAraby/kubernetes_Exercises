const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

const imagePath = path.join('/shared', 'image.jpg');

// Function to download the image using wget
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


// Download the image if it doesn't exist or is older than 60 minutes
if (!fs.existsSync(imagePath) || (Date.now() - fs.statSync(imagePath).mtimeMs) > 60 * 60 * 1000) {
    downloadImage();
}

// Update the image every hour
setInterval(downloadImage, 60 * 60 * 1000);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the image from /shared
app.use('/shared', express.static('/shared'));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
