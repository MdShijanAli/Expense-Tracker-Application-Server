const categoryModel = require('../models/categoryModel')();
const formatResultData = require('../utils/formatResultsData');

function categoryController() {
  // Get All Categoeies
  const getAllCategories = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const result = await categoryModel.getAllCategories(pageNum, limitNum);
      const total = result?.total;

      formatResultData({
        res,
        total,
        limitNum,
        pageNum,
        apiEndPoint: 'categories',
        result: result?.categories,
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

    if (!value) {
      return res.status(400).json({ status: 'error', message: 'Category Value is Required' });
    }

    try {
      const result = await categoryModel.createCategory(value);
      if (result) {
        res.json({
          status: 'success',
          message: 'Executed Successfully',
          result: result
        });
      } else {
        res.status(404).json({ status: 'not found', message: 'Category not found' });
      }
    } catch (err) {
      console.error('Error getting Category By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };

  // Get Single Category
  const getCategoryByID = async (req, res) => {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({ status: 'error', message: 'Category ID is required' });
    }

    try {
      const result = await categoryModel.getCategoryByID(categoryId);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully', result: result });
      } else {
        res.status(404).json({ status: 'not found', message: 'Category not found' });
      }
    } catch (err) {
      console.error('Error getting Category By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
    deleteCategoryByID
  }
}

module.exports = categoryController;