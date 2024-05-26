const CategoryModel = require('../models/categoryModel');

class CategoryController {
  // Get All Categoeies
  async getAllCategories(req, res) {
    const categoryModel = new CategoryModel();
    try {
      const result = await categoryModel.getAllCategories();
      res.json({ status: 'success', message: 'Executed Successfully', results: { total: result?.length, data: result } });
    } catch (err) {
      console.error('Error getting Categories:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Create Category
  async createCategory(req, res) {
    const categoryModel = new CategoryModel();
    const value = req.body;

    if (!value) {
      return res.status(400).json({ status: 'error', message: 'Category ID is required' });
    }

    try {
      const result = await categoryModel.createCategory(value);
      if (result) {
        const categoryID = result?.insertedId;

        if (categoryID) {
          try {
            const result = await categoryModel.getCategoryByID(categoryID);
            if (result) {
              res.json({ status: 'success', message: 'Executed Successfully', result: result });
            } else {
              res.status(404).json({ status: 'not found', message: 'Category not found' });
            }
          } catch (err) {
            console.error('Error getting Category By ID:', err);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
          }
        }
      }

    } catch (err) {
      console.error('Error getting Category By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }

  // Get Single Category
  async getCategoryByID(req, res) {
    const categoryModel = new CategoryModel();
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
  }

  // Delete Single Category
  async deleteCategoryByID(req, res) {
    const categoryModel = new CategoryModel();
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({ status: 'error', message: 'Category ID is required' });
    }

    try {
      const result = await categoryModel.deleteCategoryByID(categoryId);
      if (result) {
        res.json({ status: 'success', message: 'Executed Successfully', result: "Deleted Successfully" });
      } else {
        res.status(404).json({ status: 'not found', message: 'Category not found' });
      }
    } catch (err) {
      console.error('Error getting Category By ID:', err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }




}

module.exports = new CategoryController();