const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

function userModel() {

  /**
 * Retrieves a user by their email address
 * @param {string} email - The email address to search for
 * @returns {Promise<Object|null>} The user object or null if not found
 * @throws {Error} If the email is invalid or database operation fails
 */

  const getCollection = async () => {
    return client.db(process.env.DB_NAME).collection("users");
  };

  // Get Cost By ID
  const getUserByEmail = async (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    try {
      const collection = await getCollection();
      const user = await collection.findOne({ email: email });

      return user
    } catch (err) {
      console.error('Failed to fetch user:', err);
     throw new Error('Failed to fetch user');
    }
  }

  return {
    getUserByEmail
  }

}

module.exports = userModel;