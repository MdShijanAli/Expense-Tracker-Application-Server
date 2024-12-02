const categoryModel = require('../models/categoryModel')();
const { ObjectId } = require('mongodb');
const formatResultData = require('../utils/formatResultsData');
const pageAndLimitValidation = require('../utils/pageAndLimitValidation');


function categoryController() {
  // Get All Categories
  const getAllCategories = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    try {
      const pageNum = pageAndLimitValidation(page);
      const limitNum = pageAndLimitValidation(limit);
      const result = await categoryModel.getAllCategories(pageNum, limitNum);
      const total = result?.total;

      formatResultData({
        res,
        total,
        limitNum,
        pageNum,
        apiEndPoint: 'categories',
        result: result?.categories ?? [],
        totalResults: total
      });
    } catch (err) {
      console.error('Error getting Categories:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };

  // Create Category
  const createCategory = async (req, res) => {
    const value = req.body;

    if (!value.name) {
      return res.status(400).json({ status: 'error', message: 'Name Value is Required' });
    }

    const requiredFields = ['name', 'user', 'type']; // add other required fields
    const missingFields = requiredFields.filter(field => !value[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${ missingFields.join(', ') }`
      });
    }

    try {
      // Call the model to create the category
      const result = await categoryModel.createCategory(value);

      // Handle the case where the category already exists
      if (result.error) {
        return res.status(400).json({ status: 'error', message: result.message });
      }

      const objectId = new ObjectId(result.insertedId);
      const idString = objectId.toString();

      // Fetch the created category by its insertedId
      const createdCategory = await categoryModel.getCategoryByID(idString);

      // If category is found, return the full created data
      if (createdCategory) {
        res.json({
          status: 'success',
          message: 'Category created successfully',
          result: createdCategory,
        });
      } else {
        res.status(404).json({ status: 'error', message: 'Failed to retrieve created category' });
      }
    } catch (err) {
      console.error('Error creating Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };

  const updateCategory = async (req, res) => {
    const { id } = req.params;
    const value = req.body;

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid category ID' });
    }

    try {
      // Call the model to update the category
      const result = await categoryModel.updateCategory(id, value);

      // Handle the case where the category is not found
      if (result.modifiedCount === 0) {
        return res.status(404).json({ status: 'error', message: 'Category not found' });
      }

      const updatedCategory = await categoryModel.getCategoryByID(id);

      if (!updatedCategory) {
        return res.status(404).json({ status: 'error', message: 'Category not found' });
      }

      res.json({ status: 'success', message: 'Category updated successfully', result: updatedCategory });
    } catch (err) {
      console.error('Error updating Category:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };


  const handleUserCategories = async (req, res, getCategoryFn, type) => {
    const { user, page = 1, limit = 12, search = "" } = req.query;
    const pageNum = pageAndLimitValidation(page);
    const limitNum = pageAndLimitValidation(limit);

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'User Email is required' });
    }

    try {
      const result = await getCategoryFn(user, pageNum, limitNum, search);
      formatResultData({
        res,
        total: result?.total,
        limitNum,
        pageNum,
        apiEndPoint: 'categories',
        result: result?.categories ?? [],
        totalResults: result?.total
      });
    } catch (err) {
      console.error(`Error getting User ${ type } Categories:`, err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };


  const getUserFundCategories = async (req, res) => {
    return handleUserCategories(req, res, categoryModel.getUserFundCategories, 'Fund');
  };

  const getUserCostCategories = async (req, res) => {
    return handleUserCategories(req, res, categoryModel.getUserCostCategories, 'Cost');
  };


  // Get Single Category
  // Get Single Category
  const getCategoryByID = async (req, res) => {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({
        status: 'error',
        message: 'Category ID is required'
      });
    }

    try {
      const result = await categoryModel.getCategoryByID(categoryId);

      if (result) {
        return res.json({
          status: 'success',
          message: 'Executed Successfully',
          result: result
        });
      } else {
        return res.status(404).json({
          status: 'not found',
          message: 'Category not found'
        });
      }
    } catch (err) {
      // Log the error for debugging purposes
      console.error('Error getting Category By ID:', err);

      // Send the error message to the client
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    }
  };

  // Delete Single Category
  const deleteCategoryByID = async (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Category ID is required' });
    }

    try {
      const result = await categoryModel.deleteCategoryByID(id);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully' });
      } else {
        res.status(404).json({ status: 'not found', message: 'Category not found' });
      }
    } catch (err) {
      console.error('Error deleting Category By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };

  return {
    getAllCategories,
    createCategory,
    getCategoryByID,
    deleteCategoryByID,
    getUserFundCategories,
    updateCategory,
    getUserCostCategories
  }
}

module.exports = categoryController;