const formatResultData = require("../utils/formatResultsData");

const fundsModel = require("../models/fundModel")()

function fundsController() {
  // Post  a FUnd
  const createFund = async (req, res) => {
    const value = req.body;
    try {
      const result = await fundsModel.createFund(value);
      const createdID = result?.insertedId;
      if (createdID) {
        const createdFund = await fundsModel.getFundByID(createdID);
        res.json({
          status: 'success',
          message: 'Executed Successfully',
          results: createdFund
        });
      }
    } catch (err) {
      console.error('Error Posting Funds:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

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
    const { user: userEmail, page = 1, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundsByUserEmail(userEmail, pageNum, limitNum);
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
        res.status(404).json({ status: 'not found', message: 'Fund not found' });
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

    console.log('Category: ', category, 'User: ', user);
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
  const getFundsByCategoryAndUser = async (req, res) => {

    const { category_name: category, user: userEmail, page = 1, limit = 20 } = req.query;

    if (!category && !userEmail) {
      return res.status(400).json({ status: 'error', message: 'Category and User is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundsByCategoryAndUser(category, userEmail, pageNum, limitNum);
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
        res.status(404).json({ status: 'not found', message: 'Funds not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get a user all category name and Money
  const getFundCategoryWithValue = async (req, res) => {

    const { user: userEmail, page = 1, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await fundsModel.getFundCategoryWithValue(userEmail, pageNum, limitNum);
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
        res.status(404).json({ status: 'not found', message: 'Fund not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By User:', err);
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
    getFundsByCategoryAndUser,
    getFundCategoryWithValue
  }

}

module.exports = fundsController;