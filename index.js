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
    message: `Route ${ req.method } ${ req.originalUrl } not found`,
  });
});

// Function to start the server after successful DB connection
async function startServer() {
  let retries = 3;
  try {
    while (retries > 0) {
      try {
        await client.connect();
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        console.log(`Failed to connect. Retrying... (${ retries } attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('Connected to MongoDB');

    // Start your Express server here
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${ port }`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await client.close();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();