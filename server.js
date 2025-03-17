const express = require('express');
const path = require('path');
const app = express();

// For development, serve from the public directory
if (process.env.NODE_ENV === 'development') {
  // In development, we'll proxy to the React dev server
  console.log('Running in development mode');
  app.get('*', (req, res) => {
    res.send('Development mode: Please use "npm run dev" instead for local development');
  });
} else {
  // In production (like on Render), serve from the build directory
  console.log('Running in production mode');
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});