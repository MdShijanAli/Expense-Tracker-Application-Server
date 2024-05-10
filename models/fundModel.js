const connection = require("../config/database");
const { ObjectId } = require('mongodb');

class FundModal {
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
  async getFundsByCategoryAndUser(category, userEmail) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("funds");
      const funds = await collection.find({ category: category, user: userEmail }).sort({ _id: -1 }).toArray();
      return funds
    } catch (err) {
      console.log('Error', err);
    } finally {
      await connection.close();
    }
  }



}

module.exports = FundModal