const express = require('express');
const CategoryController = require('../controllers/categoryController');
const FundsController = require('../controllers/fundsController')

const router = express.Router();

// Categories
router.post('/api/categories', CategoryController.createCategory);
router.get('/api/categories', CategoryController.getAllCategories);
router.get('/api/categories/:id', CategoryController.getCategoryByID);
router.delete('/api/categories/:id', CategoryController.deleteCategoryByID);

// Funds
router.get('/api/funds', FundsController.getAllFunds);
router.get('/api/funds/:id', FundsController.getFundByID);
router.get('/api/user-funds/:user', FundsController.getFundsByUserEmail);
router.get('/api/category-funds/:category', FundsController.getFundsByCategory);
router.get('/api/date-funds', FundsController.getFundsByDate);
router.get('/api/user-funds/:category/:user', FundsController.getFundsByCategoryAndUser);

module.exports = router;
