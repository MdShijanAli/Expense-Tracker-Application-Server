const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

function categoryModel() {
  const getCollection = async() => {
    return client.db(process.env.DB_NAME).collection("categories");
  };
  
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
      const total = await collection.find({}).count();
      return { categories, total }
    } catch (err) {
      console.log('Error', err);
    }
  }

  // get user funds category
  const getUserFundCategories = async (user, page = 1, limit = 12, search="") => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const query = { user: user, type: "fund" };

      // Add search condition if search term is provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
        ];
  
        // If the search term is a number, include a condition to search on money
        const searchAsNumber = parseFloat(search);
        if (!isNaN(searchAsNumber)) {
          query.$or.push({ money: searchAsNumber });
        }
      }

      const pipeline = [
        { $match: query },
        { $skip: skip },
        { $limit: limit }
      ];

      const totalCount = await collection.countDocuments(query);
      const categories = await collection.aggregate(pipeline).toArray();
      return {total: totalCount, categories}
    } catch (err) {
      console.log('Error', err);
    }
  }

  // get user costs category
  const getUserCostCategories = async (user, page = 1, limit = 12, search="") => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const query = { user: user, type: "cost" };

      // Add search condition if search term is provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
        ];
  
        // If the search term is a number, include a condition to search on money
        const searchAsNumber = parseFloat(search);
        if (!isNaN(searchAsNumber)) {
          query.$or.push({ money: searchAsNumber });
        }
      }

      const pipeline = [
        { $match: query },
        { $skip: skip },
        { $limit: limit }
      ];

      const totalCount = await collection.countDocuments(query);
      const categories = await collection.aggregate(pipeline).toArray();
      return {total: totalCount, categories}
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
    deleteCategoryByID,
    getUserFundCategories,
    getUserCostCategories
  }

}

module.exports = categoryModel;
