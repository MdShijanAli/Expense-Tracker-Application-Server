const formatResultData = require('../utils/formatResultsData');
const costModel = require('./../models/costModel')();

function costController() {

  // Post  a FUnd
  const createCost = async (req, res) => {
    const value = req.body;
    try {
      const result = await costModel.createCost(value);
      const createdID = result?.insertedId;
      if (createdID) {
        const createdCost = await costModel.getCostByID(createdID);
        res.json({
          status: 'success',
          message: 'Executed Successfully',
          results: createdCost
        });
      }
    } catch (err) {
      console.error('Error Inserting Cost:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Update a FUnd
  const updateCostByID = async (req, res) => {
    const id = req.params.id
    const value = req.body;
    try {
      const result = await costModel.updateCostByID(id, value);
      if (result) {
        const updatedCost = await costModel.getCostByID(id);
        res.json({
          status: 'success',
          message: 'Executed Successfully',
          results: updatedCost
        });
      }

    } catch (err) {
      console.error('Error Posting Cost:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get All Funds
  const getAllCosts = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getAllCosts(pageNum, limitNum);
      const total = result?.total?.length;

      formatResultData({
        res,
        total,
        limitNum,
        pageNum,
        apiEndPoint: 'costs',
        result: result?.costs,
        totalResults: total
      })

    } catch (err) {
      console.error('Error getting Costs:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get FUnds By IID
  const getCostByID = async (req, res) => {
    const costID = req.params.id;

    if (!costID) {
      return res.status(400).json({ status: 'error', message: 'Cost ID is required' });
    }

    try {
      const result = await costModel.getCostByID(costID);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully', result: result });
      } else {
        res.status(404).json({ status: 'not found', message: 'Cost not found' });
      }
    } catch (err) {
      console.error('Error getting Cost By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Delete Cost By IID
  const deleteCostByID = async (req, res) => {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Cost ID is required' });
    }

    try {
      const result = await costModel.deleteCostByID(id);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully' });
      } else {
        res.status(404).json({ status: 'not found', message: 'Cost not found' });
      }
    } catch (err) {
      console.error('Error deleting Cost By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get Costs By User Email
  const getCostsByUserEmail = async (req, res) => {
    const { user: userEmail, page = 1, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostsByUserEmail(userEmail, pageNum, limitNum);
      console.log('Result: ', result);
      const total = result?.total?.length;
      if (result?.costs.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'costs/user-costs',
          queryString: `user=${ userEmail }`,
          result: result?.costs,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Costs not found' });
      }
    } catch (err) {
      console.error('Error getting Cost By User Email:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get Costs By User Email
  const getCostsByCategory = async (req, res) => {
    const { category_name: category, page = 1, limit = 20 } = req.query;

    if (!category) {
      return res.status(400).json({ status: 'error', message: 'Category Name is required' });
    }

    console.log("category: ", category, 'Page: ', 1, 'Limit: ', limit);

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostsByCategory(category, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.costs.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'costs/cost-category',
          queryString: `category_name=${ category }`,
          result: result?.costs,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Costs not found' });
      }
    } catch (err) {
      console.error('Error getting Cost By This Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }


  // Get Costs Category By User Email
  const getCostsByCategoryByUser = async (req, res) => {
    const { category_name: category, user: userEmail, page = 1, limit = 20 } = req.query;

    if (!category && !userEmail) {
      return res.status(400).json({ status: 'error', message: 'Category Name and Email is required' });
    }

    console.log("category: ", category, 'Page: ', 1, 'Limit: ', limit);

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostsByCategoryByUser(category, userEmail, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.costs.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'costs/user-cost-category',
          queryString: `category_name=${ category }&user=${ userEmail }`,
          result: result?.costs,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Costs not found' });
      }
    } catch (err) {
      console.error('Error getting Cost By This Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get a user all category name and Money
  const getCostCategoryWithValue = async (req, res) => {
    const { user: userEmail, page = 1, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User Email ID is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostCategoryWithValue(userEmail, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.costs.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'costs/user-all-cost-category/lists',
          queryString: `user=${ userEmail }`,
          result: result?.costs,
          totalResults: total
        })
      } else {
        res.status(404).json({ status: 'not found', message: 'Cost not found' });
      }
    } catch (err) {
      console.error('Error getting Fund By User:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Delete Category for a User
  const deleteCostCategoryByUser = async (req, res) => {
    const { category, user } = req.query;

    console.log('Category: ', category, 'User: ', user);
    if (!category || !user) { // Check for category and user
      return res.status(400).json({ status: 'error', message: 'Category and User Email are required' });
    }

    try {
      const deletedCount = await costModel.deleteCostCategoryByUser(category, user);
      if (deletedCount > 0) {
        res.json({ status: 'success', message: 'Executed Successfully', deletedCount: deletedCount });
      } else {
        res.status(404).json({ status: 'not found', message: 'No Costs for the specified category and user' });
      }
    } catch (err) {
      console.error('Error deleting Cost Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }


  // Get FUnds By Date
  const getCostsByDate = async (req, res) => {
    const { start_date, end_date, user: userEmail, page = 1, limit = 20 } = req.query;

    if (!start_date || !end_date || !userEmail) {
      return res.status(400).json({ status: 'error', message: 'Start Date and End Date is required' });
    }

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await costModel.getCostsByDate(start_date, end_date, userEmail, pageNum, limitNum);
      const total = result?.total?.length;
      if (result?.costs?.length > 0) {
        formatResultData({
          res,
          total,
          limitNum,
          pageNum,
          apiEndPoint: 'costs/date-costs',
          queryString: `start_date=${ start_date }&end_date=${ end_date }&user=${ userEmail }`,
          result: result?.costs,
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
    getCostsByDate
  }
}

module.exports = costController;