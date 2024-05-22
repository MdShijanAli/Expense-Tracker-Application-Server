const connection = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  await connection.connect();
  return connection.db(process.env.DB_NAME).collection("costs");
}

function costModel() {

  // Post a Cost
  const createCost = async (value) => {
    const timestamp = new Date();  // Get the current timestamp

    // Add the `created_at` and `updated_at` fields to the value object
    value.created_at = timestamp;
    value.updated_at = timestamp;

    let collection;
    try {
      collection = await getCollection();
      const costs = await collection.insertOne(value);
      return costs
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Get All Costs
  const getAllCosts = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({}).toArray(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Get Cost By ID
  const getCostByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const cost = await collection.findOne({ _id: new ObjectId(id) });
      return cost
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Delete Cost By ID
  const deleteCostByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const cost = await collection.deleteOne({ _id: new ObjectId(id) });
      return cost
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Get Cost By User Email
  const getCostsByUserEmail = async (userEmail, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({ user: userEmail }).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({ user: userEmail }).toArray(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Get Cost By User Email
  const getCostsByCategory = async (category, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({ category: category }).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({ category: category }).toArray(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Get Cost By User Email
  const getCostsByCategoryByUser = async (category, user, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({ category: category, user: user }).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({ category: category, user: user }).toArray(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  const getCostCategoryWithValue = async (user, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit

      // Initial aggregation pipeline to get the total count
      const totalPipeline = [
        { $match: { user: user } }, // Filter documents by user
        { $group: { _id: "$category", name: { $first: "$category" }, money: { $sum: "$money" } } }
      ];

      // Aggregation pipeline with limit and skip
      const pipeline = [
        { $match: { user: user } }, // Filter documents by user
        { $group: { _id: "$category", name: { $first: "$category" }, money: { $sum: "$money" } } },
        { $sort: { name: 1 } }, // Sort by category name
        { $skip: skip }, // Skip documents for pagination
        { $limit: limit } // Limit the number of documents
      ];
      const costs = await collection.aggregate(pipeline).toArray();
      const total = await collection.aggregate(totalPipeline).toArray();

      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }


  return {
    createCost,
    getAllCosts,
    getCostByID,
    deleteCostByID,
    getCostsByUserEmail,
    getCostsByCategory,
    getCostsByCategoryByUser,
    getCostCategoryWithValue
  }

}

module.exports = costModel;