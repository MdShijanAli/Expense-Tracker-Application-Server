const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

// Function to connect to MongoDB
const connectToDatabase = async () => {

  const MAX_RETRIES = 3;
  const TIMEOUT = 5000;
  let attempts = 0;

  try {
    while (attempts < MAX_RETRIES) {
          try {
            await Promise.race([
              client.connect(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT)
              )
            ]);
            console.log('Connected to MongoDB');
            return client;
          } catch (error) {
            attempts++;
            if (attempts === MAX_RETRIES) throw error;
            console.log(`Connection attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    await client.close().catch(console.error);
    process.exit(1); // Exit the process if connection fails
  }
};

// Export the client and connection function
module.exports = { client, connectToDatabase };
