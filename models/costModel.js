const connection = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  await connection.connect();
  return connection.db(process.env.DB_NAME).collection("costs");
}

function costModel() {

  // Get All Costs
  const getAllCosts = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.countDocuments(); // Get the total count of documents
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


  return {
    getAllCosts,
    getCostByID,
    deleteCostByID
  }

}

module.exports = costModel;