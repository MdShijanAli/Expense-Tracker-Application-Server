const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

async function getCollection() {
  // Ensure that the client is connected
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect(); // Connect only if not already connected
  }

  // Return the desired collection
  return client.db(process.env.DB_NAME).collection("funds");
}


function fundsModel() {
  // Post a Fund
  const createFund = async (value) => {
    let collection;
    const timestamp = new Date();  // Get the current timestamp

    // Add the `created_at` and `updated_at` fields to the value object
    value.created_at = timestamp;
    value.updated_at = timestamp;
    try {
      collection = await getCollection();
      const funds = await collection.insertOne(value);
      return funds
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Update a Fund
  const updateFundByID = async (id, value) => {
    let collection;
    const timestamp = new Date();

    // Add `updated_at` field to the value object
    value.updated_at = timestamp;
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

      const funds = await collection.updateOne(filter, updatedValues);
      return funds
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get All FUnds
  const getAllFunds = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const funds = await collection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({}).toArray(); // Get the total count of documents
      return { funds, total }
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get Fund By ID
  const getFundByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const funds = await collection.findOne({ _id: new ObjectId(id) });
      return funds
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Delete Fund By ID
  const deleteFundByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const funds = await collection.deleteOne({ _id: new ObjectId(id) });
      return funds
    } catch (err) {
      console.log('Error', err);
    }
  }

  const getFundsByUserEmail = async (userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "") => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const sort = {};
      sort[sort_by] = sort_order === 'asc' ? 1 : -1;

      const query = { user: userEmail };

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

      const funds = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).toArray();
      return { funds, total };
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Get Fund By Category
  const getFundsByCategory = async (category, page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const funds = await collection.find({ category: category }).sort({ _id: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find({ category: category }).toArray(); // Get the total count of documents
      return { funds, total }
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Delete a Fund Category for a User
  const deleteFundsCategoryByUser = async (category, user) => {
    let collection;
    try {
      collection = await getCollection();
      const result = await collection.deleteMany({ category: category, user: user });
      return result.deletedCount; // Return the number of documents deleted
    } catch (err) {
      console.log('Error', err);
      throw err; // Rethrow the error to be caught in the controller
    }
  }


  // Get Fund By Date
  const getFundsByDate = async (startDate, endDate, userEmail, page = 1, limit = 20) => {
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
      const funds = await collection.find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).toArray();
      return { funds, total }
    } catch (err) {
      console.log('Error', err);
    }
  }


  // Get Fund Category for specific user
  const getFundsByCategoryAndUser = async (category, userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "", startDate, endDate) => {
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
        $gte: startDate,
        $lte: endDate
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

      const funds = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();
      const total = await collection.find(query).toArray(); // Get the total count of documents
      return { funds, total }
    } catch (err) {
      console.log('Error', err);
    }
  }


  const getFundCategoryWithValue = async (user, page = 1, limit = 20, search = "") => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit;

      // Query object
      const query = { user: user };

      // Add search condition if search term is provided
      if (search) {
        query.$or = [
          { category: { $regex: search, $options: 'i' } },
        ];

        // If the search term is a number, include a condition to search on money
        const searchAsNumber = parseFloat(search);
        if (!isNaN(searchAsNumber)) {
          query.$or.push({ money: searchAsNumber });
        }
      }

      // Initial aggregation pipeline to get the total count
      const totalPipeline = [
        { $match: query },
        { $group: { _id: "$category", name: { $first: "$category" }, money: { $sum: "$money" } } }
      ];

      const pipeline = [
        { $match: query },
        { $group: { _id: "$category", name: { $first: "$category" }, money: { $sum: "$money" } } },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      // Execute both pipelines
      const funds = await collection.aggregate(pipeline).toArray();
      const total = await collection.aggregate(totalPipeline).toArray();

      // Return funds and total count
      return { funds, total };
    } catch (err) {
      console.error('Error:', err);
      throw err; // Rethrow error to handle it in the calling function
    }
  };


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

  const getAYearTotalFunds = async (userEmail, year) => {
    let collection;
    try {
      collection = await getCollection();

      const funds = await collection.find({}).toArray();

      // Calculate total money for each month
      const monthlyTotals = {};

      // Initialize an object with the months of the current year
      const currentYearMonths = new Array(12).fill(0).map((_, index) => {
        return `${ year }-${ (index + 1).toString().padStart(2, '0') }`;
      });

      currentYearMonths.forEach(monthYear => {
        monthlyTotals[monthYear] = 0;
      });

      funds.forEach(entry => {
        const monthYear = entry.date.substring(0, 7); // Extracting "YYYY-MM"
        if (currentYearMonths.includes(monthYear)) {
          monthlyTotals[monthYear] += entry.money;
        }
      });

      // Convert object to array and sort by month
      const sortedMonthlyTotals = Object.entries(monthlyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});



      return sortedMonthlyTotals;
    } catch (err) {
      console.log('Error', err);
    }
  };


  const getUserCurrentYearData = async (userEmail, year) => {
    let collection;
    try {
      collection = await getCollection();

      // Array to hold results
      const resultData = [];

      let totalSum = 0;

      // Loop through all months of the specified year
      for (let month = 1; month <= 12; month++) {
        // Format the month with leading zero if necessary
        const formattedMonth = String(month).padStart(2, '0');

        const startDate = `${ year }-${ formattedMonth }-01`;
        const endDate = `${ year }-${ formattedMonth }-31`;

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

        totalSum += totalMoney

        // Push the month and money into the resultData array
        resultData.push(totalMoney);
      }

      return { resultData, total: totalSum };
    } catch (err) {
      console.log('Error', err);
    }
  };


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
    getAMonthUserTotalFundAmount,
    getAYearTotalFunds,
    getUserCurrentYearData
  }

}

module.exports = fundsModel