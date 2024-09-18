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

  // Update a Cost
  const updateCostByID = async (id, value) => {
    const timestamp = new Date();

    // Add `updated_at` field to the value object
    value.updated_at = timestamp;
    let collection;
    try {
      collection = await getCollection();
      console.log("ID", id, "Value: ", value);
      const filter = { _id: new ObjectId(id) }

      // Retrieve the existing document
      const existingDoc = await collection.findOne(filter);
      if (!existingDoc) {
        throw new Error(`Document with id ${ id } not found`);
      }

      // Merge existing values with new values
      const updatedValues = {
        $set: {
          category: value?.category !== "" ? value.category : existingDoc.category,
          money: value?.money !== null ? value.money : existingDoc.money,
          date: value?.date !== "" ? value.date : existingDoc.date,
          time: value?.time !== "" ? value.time : existingDoc.time,
          notes: value?.notes !== "" ? value.notes : existingDoc.notes,
          user: value?.user !== "" ? value.user : existingDoc.user,
          created_at: existingDoc?.created_at ? existingDoc.created_at : timestamp,
          updated_at: timestamp
        }
      };

      const cost = await collection.updateOne(filter, updatedValues);
      return cost
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
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


  // Get Costs By Date
  const getCostsByDate = async (startDate, endDate, userEmail, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const query = {
        user: userEmail,
        date: {
          $gte: startDate, // Ensure dates are in proper ISO format or Date objects
          $lte: endDate
        }
      };
      const costs = await collection.find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).toArray();
      return { costs, total }
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Delete a Cost Category for a User
  const deleteCostCategoryByUser = async (category, user) => {
    let collection;
    try {
      collection = await getCollection();
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

  // Get Cost By User Email
  const getUserTotalCostAmount = async (userEmail) => {
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

  const getUserCurrentYearData = async (userEmail, year) => {
    let collection;
    try {
      collection = await getCollection();
  
      // Define an array of month names
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
  
      // Array to hold results
      const resultData = [];
  
      // Loop through all months of the specified year
      for (let month = 1; month <= 12; month++) {
        // Format the month with leading zero if necessary
        const formattedMonth = String(month).padStart(2, '0');
        
        const startDate = `${year}-${formattedMonth}-01`;
        const endDate = `${year}-${formattedMonth}-31`;
  
        console.log("Fetching data for", startDate, endDate);
  
        // Aggregation pipeline to calculate total money for each month
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
  
        // Extract the total money value from the result
        const totalMoney = result.length > 0 ? result[0].totalMoney : 0;
  
        // Push the month and money into the resultData array
        resultData.push({[monthNames[month - 1]]: totalMoney });
      }
  
      return resultData;
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (connection) await connection.close();
    }
  };  

  const getAMonthUserTotalCostAmount = async (userEmail, currentMonth) => {
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
    createCost,
    updateCostByID,
    getAllCosts,
    getCostByID,
    deleteCostByID,
    getCostsByUserEmail,
    getCostsByCategory,
    getCostsByCategoryByUser,
    getCostCategoryWithValue,
    deleteCostCategoryByUser,
    getCostsByDate,
    getUserTotalCostAmount,
    getUserCurrentYearData,
    getAMonthUserTotalCostAmount
  }

}

module.exports = costModel;