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
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start Express server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing MongoDB client');
      await client.close();
      console.log('MongoDB client closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error starting the server:', err);
    process.exit(1);
  }
};

startServer(); // Call the function to connect to DB and start the server
