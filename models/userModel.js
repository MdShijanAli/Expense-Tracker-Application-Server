const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

function userModel() {

  const getCollection = async() => {
    return client.db(process.env.DB_NAME).collection("users");
  };

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