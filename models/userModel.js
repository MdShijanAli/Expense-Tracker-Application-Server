const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  // Ensure that the client is connected
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect(); // Connect only if not already connected
  }

  // Return the desired collection
  return client.db(process.env.DB_NAME).collection("users");
}

function userModel() {

  // Get Cost By ID
  const getUserByEmail = async (email) => {
    let collection;
    try {
      collection = await getCollection();
      const user = await collection.findOne({ email: email });
      console.log('User', user);
      
      return user
    } catch (err) {
      console.log('Error', err);
    }
  }


  return {
    getUserByEmail
  }

}

module.exports = userModel;