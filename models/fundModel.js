const connection = require("../config/database");
const { ObjectId } = require('mongodb');

class FundModal {
  // Post a Fund
  async createFund(value) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.insertOne(value);
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Update a Fund
  async updateFundByID(id, value) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      console.log("ID", id, "Value: ", value);
      const filter = { _id: id }
      const updateDoc = {
        $set: value
      }
      const funds = await collection.updateOne(filter, updateDoc);
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Get All FUnds
  async getAllFunds() {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.find({}).sort({ _id: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Get Fund By ID
  async getFundByID(id) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.findOne({ _id: new ObjectId(id) });
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Delete Fund By ID
  async deleteFundByID(id) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.deleteOne({ _id: new ObjectId(id) });
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Get Fund By User Email
  async getFundsByUserEmail(userEmail) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.find({ user: userEmail }).sort({ _id: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Get Fund By Category
  async getFundsByCategory(category) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.find({ category: category }).sort({ category: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }

  // Delete a Fund Category for a User
  async deleteFundsCategoryByUser(category, user) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      console.log('Category Model: ', category, 'User: ', user);
      const result = await collection.deleteMany({ category: category, user: user });
      return result.deletedCount; // Return the number of documents deleted
    } catch (err) {
      console.log('Error', err);
      throw err; // Rethrow the error to be caught in the controller
    } finally {
      await connection.close();
    }
  }


  // Get Fund By Date
  async getFundsByDate(startDate, endDate) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const query = {
        date: {
          $gte: startDate, // Ensure dates are in proper ISO format or Date objects
          $lte: endDate
        }
      };
      const funds = await collection.find(query).sort({ date: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }


  // Get Fund Category for specific user
  async getFundsByCategoryAndUser(category, user) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      console.log('User:', user, 'Category:', category);
      const funds = await collection.find({ category: category, user: user }).sort({ _id: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }


  async getFundCategoryWithValue(user) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");

      // MongoDB aggregation pipeline
      const pipeline = [
        { $match: { user: user } },  // Filter documents by user
        { $group: { _id: "$category", name: { $first: "$category" }, value: { $sum: "$money" } } },
      ];

      const funds = await collection.aggregate(pipeline).sort({ name: 1 }).toArray();
      return funds;
    } catch (err) {
      console.error('Error:', err);
      throw err; // Rethrow error to handle it in the calling function
    } finally {
      await connection.close();
    }
  }




}

module.exports = FundModal