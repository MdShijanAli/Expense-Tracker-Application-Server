const connection = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  await connection.connect();
  return connection.db(process.env.DB_NAME).collection("funds");
}


function fundsModel() {
  // Post a Fund
  const createFund = async (value) => {
    const timestamp = new Date();  // Get the current timestamp

    // Add the `created_at` and `updated_at` fields to the value object
    value.created_at = timestamp;
    value.updated_at = timestamp;
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
  const updateFundByID = async (id, value) => {
    const timestamp = new Date();

    // Add `updated_at` field to the value object
    value.updated_at = timestamp;
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
  const getAllFunds = async () => {
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
  const getFundByID = async (id) => {
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
  const deleteFundByID = async (id) => {
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
  const getFundsByUserEmail = async (userEmail) => {
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
  const getFundsByCategory = async (category) => {
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
  const deleteFundsCategoryByUser = async (category, user) => {
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
  const getFundsByDate = async (startDate, endDate) => {
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
  const getFundsByCategoryAndUser = async (category, user) => {
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


  const getFundCategoryWithValue = async (user) => {
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

  // Get Cost By User Email
  const getUserTotalFundAmount = async (userEmail) => {
    let collection;
    try {
      collection = await getCollection();
      // Aggregation pipeline to calculate the total money
      const pipeline = [
        { $match: { user: userEmail } }, // Filter documents by user
        { $group: { _id: null, totalMoney: { $sum: "$money" } } }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      // Extract the total money value from the result
      const totalMoney = result.length > 0 ? result[0].totalMoney : 0;

      // Generate the desired object
      return { money: totalMoney };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  const getAMonthUserTotalFundAmount = async (userEmail, currentMonth) => {
    let collection;
    try {
      collection = await getCollection();

      // Define an array of month names
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      // Calculate the date range for the previous month
      const now = new Date();
      const year = now.getFullYear();

      let month;

      if (currentMonth) {
        month = now.getMonth() + 1; // Current month
      } else {
        month = now.getMonth(); // Previous month
        if (month === 0) {
          // Handle the edge case for January
          month = 12;
          year -= 1;
        }
      }

      // Get the month name
      const monthName = monthNames[month - 1];

      // Format the month with leading zero if necessary
      const formattedMonth = String(month).padStart(2, '0');

      const startDate = `${ year }-${ formattedMonth }-01`
      const endDate = `${ year }-${ formattedMonth }-31`

      console.log("startDate", startDate);
      console.log("endDate", endDate);

      // Aggregation pipeline to calculate the total money for the previous month
      const pipeline = [
        {
          $match: {
            user: userEmail,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        }, // Filter documents by user and date range
        { $group: { _id: null, totalMoney: { $sum: "$money" } } }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      console.log('Result: ', result);

      // // Extract the total money value from the result
      const totalMoney = result.length > 0 ? result[0].totalMoney : 0;

      // Generate the desired object
      return { month: monthName, money: totalMoney };
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }


  return {
    createFund,
    updateFundByID,
    getAllFunds,
    getFundByID,
    deleteFundByID,
    getFundsByUserEmail,
    getFundsByCategory,
    deleteFundsCategoryByUser,
    getFundsByDate,
    getFundsByCategoryAndUser,
    getFundCategoryWithValue,
    getUserTotalFundAmount,
    getAMonthUserTotalFundAmount
  }

}

module.exports = fundsModel