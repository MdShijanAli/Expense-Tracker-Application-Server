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
router.post('/api/funds', FundsController.createFund);
router.put('/api/funds/update', FundsController.updateFundByID);
router.get('/api/funds', FundsController.getAllFunds);
router.get('/api/fund/:id', FundsController.getFundByID);
router.get('/api/funds/:user', FundsController.getFundsByUserEmail);
router.get('/api/funds-category', FundsController.getFundsByCategory);
router.get('/api/date-funds', FundsController.getFundsByDate);
router.get('/api/user-category', FundsController.getFundsByCategoryAndUser);
router.get('/api/user-category-balance/:user', FundsController.getFundCategoryWithValue);
router.delete('/api/fund/:id', FundsController.deleteFundByID);
router.delete('/api/delete-funds-category', FundsController.deleteFundsCategoryByUser);

module.exports = router;
