const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('<h1>🚀 Hello from my Android Tablet Server!</h1><p>It is live anywhere in the world!</p>');
});

app.listen(PORT, () => {
  console.log(`Server is running locally on port ${PORT}`);
});
