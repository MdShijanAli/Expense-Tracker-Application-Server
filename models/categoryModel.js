const connection = require('../config/database');
const { ObjectId } = require('mongodb');

class CategoryModel {
  // Create Category
  async createCategory(value) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("categories");
      const categories = await collection.insertOne(value);
      return categories;
    } finally {
      await connection.close();
    }
  }

  // Get All Categories
  async getAllCategories() {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("categories");
      const categories = await collection.find({}).sort({ _id: -1 }).toArray();
      return categories;
    } finally {
      await connection.close();
    }
  }

  // Get single category by id
  async getCategoryByID(id) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("categories");
      const categories = await collection.findOne({ _id: new ObjectId(id) });
      return categories;
    } finally {
      await connection.close();
    }
  }

  // Delete single category by id
  async deleteCategoryByID(id) {
    try {
      await connection.connect();
      const collection = connection.db(process.env.DB_NAME).collection("categories");
      const categories = await collection.deleteOne({ _id: new ObjectId(id) });
      return categories;
    } finally {
      await connection.close();
    }
  }


}

module.exports = CategoryModel;
