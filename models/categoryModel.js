const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  // Ensure that the client is connected
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect(); // Connect only if not already connected
  }

  // Return the desired collection
  return client.db(process.env.DB_NAME).collection("categories");
}

function categoryModel() {
  // Create Category
  const createCategory = async (value) => {
    const timestamp = new Date();  // Get the current timestamp

    // Add the `created_at` and `updated_at` fields to the value object
    value.created_at = timestamp;
    value.updated_at = timestamp;

    let collection;
    try {
      collection = await getCollection();
      const categories = await collection.insertOne(value);
      return categories
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get All Categories
  const getAllCategories = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const categories = await collection.find({}).skip(skip).limit(limit).sort({ _id: -1 }).toArray();
      return categories;
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get single category by id
  const getCategoryByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const categories = await collection.findOne({ _id: new ObjectId(id) });
      return categories;
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Delete single category by id
  const deleteCategoryByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const categories = await collection.deleteOne({ _id: new ObjectId(id) });
      return categories
    } catch (err) {
      console.log('Error', err);
    }
  }


  return {
    createCategory,
    getAllCategories,
    getCategoryByID,
    deleteCategoryByID
  }

}

module.exports = categoryModel;
