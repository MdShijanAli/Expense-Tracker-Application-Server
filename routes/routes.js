const express = require('express');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

// Categories
router.post('/api/categories', CategoryController.createCategory);
router.get('/api/categories', CategoryController.getAllCategories);
router.get('/api/categories/:id', CategoryController.getCategoryByID);
router.delete('/api/categories/:id', CategoryController.deleteCategoryByID);

module.exports = router;
