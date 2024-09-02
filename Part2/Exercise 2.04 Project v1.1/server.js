const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

// Define the path for the image directory and image file
const assetsDir = path.join(__dirname, 'shared');
const imagePath = path.join(assetsDir, 'image.jpg');

let todos = ['TODO 1', 'TODO 2'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the assets directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

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

// Check if the image needs to be downloaded initially
if (!fs.existsSync(imagePath) || (Date.now() - fs.statSync(imagePath).mtimeMs) > 60 * 60 * 1000) {
    downloadImage();
}

// Set interval to download a new image every hour
setInterval(downloadImage, 60 * 60 * 1000);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the 'shared' directory statically
app.use('/shared', express.static(assetsDir));

// Starting the server
app.listen(port, () => {
    console.log(`Todo-app server started on port ${port}`);
});

