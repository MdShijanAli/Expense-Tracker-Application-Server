const formatResultData = require("../utils/formatResultsData");

const fundsModel = require("../models/fundModel")()

function fundsController() {
  // Post  a FUnd
  const createFund = async (req, res) => {
    const value = req.body;

    // Validate data types
    if (typeof value.money !== 'number' || isNaN(value.money)) {
      return res.status(400).json({
        status: 'error',
        message: 'Money must be a valid number',
      });
    }

    // Sanitize input
    const sanitizedValue = {
      category: String(value.category).trim(),
      money: Number(value.money),
      date: String(value.date).trim(),
      time: String(value.time).trim(),
      notes: String(value.notes).trim(),
    };

    // Check if required fields are missing
    if (!sanitizedValue.category || !sanitizedValue.money || !sanitizedValue.date ||
      !sanitizedValue.time || !sanitizedValue.notes) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: category, amount, date, or notes.',
      });
    }

    try {
      // Attempt to create the fund entry
      const result = await fundsModel.createFund(sanitizedValue);
      const createdID = result?.insertedId;

      // If the fund is successfully created
      if (createdID) {
        const createdFund = await fundsModel.getFundByID(createdID);
        console.log('Created Fund:', createdFund);
        
        return res.json({
          status: 'success',
          message: 'Fund created successfully',
          results: {
            category: createdFund.category,
            money: createdFund.money,
            date: createdFund.date,
            time: createdFund.time,
            notes: createdFund.notes
          },
        });
      } else {
        throw new Error('Failed to create fund');
      }
    } catch (err) {
      // Handle specific error cases
      if (err.message === 'Failed to create fund') {
        return res.status(400).json({
          status: 'error',
          message: 'Fund creation failed. Please check the input data.',
        });
      }

      // Handle any other unexpected errors (e.g., database or server errors)
      console.error('Error Posting Funds:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error: Something went wrong on the server.',
      });
    }
  };


  // Update a FUnd
  const updateFundByID = async (req, res) => {
    const id = req.params.id
    const value = req.body;
    try {
      const result = await fundsModel.updateFundByID(id, value);
      if (result) {
        const updatedFund = await fundsModel.getFundByID(id);
        res.json({
          status: 'success',
          message: 'Executed Successfully',
          results: updatedFund
        });
      }

    } catch (err) {
      console.error('Error Posting Funds:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }


  // Get All Funds
  const getAllFunds = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getAllFunds(pageNum, limitNum);
      const total = result?.total?.length;

      formatResultData({
        res,
        total,
        limitNum,
        pageNum,
        apiEndPoint: 'funds',
        result: result?.funds,
        totalResults: total
      })

    } catch (err) {
      console.error('Error getting FUnds:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get FUnds By IID
  const getFundByID = async (req, res) => {

    const fundID = req.params.id;

    if (!fundID) {
      return res.status(400).json({ status: 'error', message: 'FUnd ID is required' });
    }

    try {
      const result = await fundsModel.getFundByID(fundID);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully', result: result });
      } else {
        res.status(404).json({ status: 'not found', message: 'Fund not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Delete FUnds By IID
  const deleteFundByID = async (req, res) => {
    const fundID = req.query.id;

    if (!fundID) {
      return res.status(400).json({ status: 'error', message: 'FUnd ID is required' });
    }

    try {
      const result = await fundsModel.deleteFundByID(fundID);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully' });
      } else {
        res.status(404).json({ status: 'not found', message: 'Fund not found' });
      }
    } catch (err) {
      console.error('Error deleting Fund By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get FUnds By User Email
  const getFundsByUserEmail = async (req, res) => {
    const { user: userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "" } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundsByUserEmail(userEmail, pageNum, limitNum, sort_by, sort_order, search);
      const total = result?.total?.length;
      if (result?.funds?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'funds/user-funds',
          queryString: `user=${ userEmail }`,
          result: result?.funds,
          totalResults: total
        })
      } else {
        res.status(200).json({ status: 'success', message: 'Executed Successfully', results: { data: result?.funds } });
      }
    } catch (err) {
      console.error('Error getting Fund By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get FUnds By Category
  const getFundsByCategory = async (req, res) => {
    const { category_name: category, page = 1, limit = 20 } = req.query;

    if (!category) {
      return res.status(400).json({ status: 'error', message: 'Category is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundsByCategory(category, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.funds?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'funds/fund-category',
          queryString: `category_name=${ category }`,
          result: result?.funds,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Funds not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Delete Category for a User
  const deleteFundsCategoryByUser = async (req, res) => {

    const { category, user } = req.query;

    if (!category || !user) { // Check for category and user
      return res.status(400).json({ status: 'error', message: 'Category and User Email are required' });
    }

    try {
      const deletedCount = await fundsModel.deleteFundsCategoryByUser(category, user);
      if (deletedCount > 0) {
        res.json({ status: 'success', message: 'Executed Successfully', deletedCount: deletedCount });
      } else {
        res.status(404).json({ status: 'not found', message: 'No funds found for the specified category and user' });
      }
    } catch (err) {
      console.error('Error deleting Fund Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }


  // Get FUnds By Date
  const getFundsByDate = async (req, res) => {

    const { start_date, end_date, user: userEmail, page = 1, limit = 20 } = req.query;

    if (!start_date || !end_date || !userEmail) {
      return res.status(400).json({ status: 'error', message: 'Start Date , End Date and user is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundsByDate(start_date, end_date, userEmail, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.funds?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'funds/date-funds',
          queryString: `start_date=${ start_date }&end_date=${ end_date }&user=${ userEmail }`,
          result: result?.funds,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Funds not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By Date:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }


  // Get Funds Category for Specific User
  const getFunds = async (req, res) => {

    const { category_name: category, user: userEmail, page = 1, limit = 20, sort_by = '_id', sort_order = 'desc', search = "", start_date, end_date, } = req.query;

    if (!category && !userEmail) {
      return res.status(400).json({ status: 'error', message: 'Category and User is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFunds(category, userEmail, pageNum, limitNum, sort_by, sort_order, search, start_date, end_date);
      const total = result?.total?.length;
      if (result?.funds?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'funds/user-fund-category',
          queryString: `category_name=${ category }&user=${ userEmail }`,
          result: result?.funds,
          totalResults: total
        })
      } else {
        res.status(200).json({ status: 'success', message: 'Executed Successfully', results: { data: [] } });
      }
    } catch (err) {
      console.error('Error getting Fund By Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get a user all category name and Money
  const getFundCategoryWithValue = async (req, res) => {

    const { user: userEmail, page = 1, limit = 20, search = "" } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundCategoryWithValue(userEmail, pageNum, limitNum, search);
      const total = result?.total?.length;
      if (result?.funds?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'funds/user-all-fund-category/lists',
          queryString: `user=${ userEmail }`,
          result: result?.funds,
          totalResults: total
        })
      } else {
        res.status(200).json({ status: 'success', message: 'Executed Successfully', results: { data: [] } });
      }
    } catch (err) {
      console.error('Error getting Fund By User:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  const getAYearTotalFunds = async (req, res) => {
    const { user, year } = req.query;

    if (!user || !year) {
      return res.status(400).json({ status: 'error', message: 'User Email and year field is required' });
    }

    try {
      const yearNum = parseInt(year)
      const result = await fundsModel.getAYearTotalFunds(user, yearNum);
      res.json({
        status: 'success',
        message: 'Executed Successfully',
        results: result
      })
    }
    catch (err) {
      console.error('Error getting Fund By User or Year:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    getFunds,
    getFundCategoryWithValue,
    getAYearTotalFunds
  }

}

module.exports = fundsController;