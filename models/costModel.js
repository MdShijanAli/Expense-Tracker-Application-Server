const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

function costModel() {

  const getCollection = async () => {
    if (!process.env.DB_NAME) {
      throw new Error('Database name not configured');
    }
    try {
      return client.db(process.env.DB_NAME).collection("costs");
    } catch (error) {
      console.error('Failed to get collection:', error);
      throw error;
    }
  };

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
    }
  }

  // Get All Costs
  const getAllCosts = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({}).countDocuments(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
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
    }
  }

  // Get Cost By User Email
  const getCostsByUserEmail = async (userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "") => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const sort = {};
      sort[sort_by] = sort_order === 'asc' ? 1 : -1;

      const query = { user: userEmail };

      // Add search condition if search term is provided
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchAsNumber = parseFloat(search);
        query.$or = [
          { category: { $regex: escapedSearch, $options: 'i' } },
          { notes: { $regex: escapedSearch, $options: 'i' } },
          { time: { $regex: escapedSearch, $options: 'i' } },
          // { date: { $regex: escapedSearch, $options: 'i' } }
          { date: { $regex: search, $options: 'i' } }
        ];

        // Handle numeric search separately
        if (!Number.isNaN(searchAsNumber)) {
          query.$or.push({ money: searchAsNumber });
        }
      }

      const costs = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).count();
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get Cost By User Email
  const getCostsByCategory = async (category, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const costs = await collection.find({ category: category }).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({ category: category }).count(); // Get the total count of documents
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get Cost By User Email
  const getCosts = async (category, userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "", startDate, endDate) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const sort = {};
      sort[sort_by] = sort_order === 'asc' ? 1 : -1;

      const query = {
        user: userEmail,
        category: category,
      };

      // Add date range filter only if both startDate and endDate are provided
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Add search condition if search term is provided
      if (search) {
        query.$or = [
          { category: { $regex: search, $options: 'i' } }, // Case-insensitive search in 'description'
          { money: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { time: { $regex: search, $options: 'i' } },
          { date: { $regex: search, $options: 'i' } }
        ];
      }

      const costs = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).count();
      return { costs, total };
    } catch (err) {
      console.log('Error', err);
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
      const total = await collection.find(query).count();
      return { costs, total }
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Delete a Cost Category for a User
  const deleteCostCategoryByUser = async (category, user) => {
    let collection;
    try {
      collection = await getCollection();
      const result = await collection.deleteMany({ category: category, user: user });
      return result.deletedCount; // Return the number of documents deleted
    } catch (err) {
      throw err; // Rethrow the error to be caught in the controller
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
    }
  }

  const getUserCurrentYearData = async (userEmail, year) => {
    let collection;
    try {
      collection = await getCollection();

      // Array to hold results
      const resultData = [];

      let totalCost = 0;

      // Loop through all months of the specified year
      for (let month = 1; month <= 12; month++) {
        // Format the month with leading zero if necessary
        const formattedMonth = String(month).padStart(2, '0');

        const startDate = `${ year }-${ formattedMonth }-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

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

        totalCost += totalMoney

        // Push the month and money into the resultData array
        resultData.push(totalMoney);
      }

      return { resultData, total: totalCost };
    } catch (err) {
      console.log('Error', err);
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

      // // Extract the total money value from the result
      const totalMoney = result.length > 0 ? result[0].totalMoney : 0;

      // Generate the desired object
      return { month: monthName, money: totalMoney };
    } catch (err) {
      console.log('Error', err);
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
    getCosts,
    deleteCostCategoryByUser,
    getCostsByDate,
    getUserTotalCostAmount,
    getUserCurrentYearData,
    getAMonthUserTotalCostAmount
  }

}

module.exports = costModel;