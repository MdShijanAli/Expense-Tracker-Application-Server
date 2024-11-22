const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const { connectToDatabase, client } = require('./config/database'); // Import database client and connection

app.use(cors());
app.use(express.json());

const routes = require('./routes/routes');
app.use('/', routes);

// Middleware for handling all unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Function to start the server after successful DB connection
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Start your Express server here
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

startServer();