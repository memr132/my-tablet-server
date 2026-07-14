const express = require('express');
const serveIndex = require('serve-index');
const app = express();
const PORT = 3000;

// This tells the server to share your entire Termux home folder + tablet storage!
const FOLDER_TO_SERVE = '/data/data/com.termux/files/home';

// Enable static file downloading and the beautiful folder icon directory list
app.use('/', express.static(FOLDER_TO_SERVE), serveIndex(FOLDER_TO_SERVE, { 'icons': true }));

app.listen(PORT, () => {
  console.log(`📁 Global File Server is running on port ${PORT}`);
});
