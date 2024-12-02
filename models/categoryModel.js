const { client } = require("../config/database");
const { ObjectId } = require('mongodb');

function categoryModel() {
  const getCollection = async () => {
    if (!process.env.DB_NAME) {
      throw new Error('Database name not configured');
    }
    try {
      return client.db(process.env.DB_NAME).collection("categories");
    } catch (error) {
      console.error('Failed to get categories collection:', error);
      throw error;
    }
  };

  // Create Category
  const createCategory = async (value) => {
    const timestamp = new Date();

    value.created_at = timestamp;
    value.updated_at = timestamp;

    let collection;
    try {
      collection = await getCollection();

      // Check if a category with the same name already exists for this user
      const existingCategory = await collection.findOne({ name: value.name, user: value.user });
      if (existingCategory) {
        return { error: true, message: "This Category name already exists for this user." };
      }

      const categories = await collection.insertOne(value);
      return categories
    } catch (err) {
      console.error('Failed to create category:', err);
      throw err;
    }
  }

  const updateCategory = async (id, value) => {
    let collection;

    const timestamp = new Date();

    value.updated_at = timestamp;
    try {
      collection = await getCollection();
      const filter = { _id: new ObjectId(id) };
      const result = await collection.updateOne(filter, { $set: value });
      return result;
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  }

  // Get All Categories
  const getAllCategories = async (page = 1, limit = 20) => {
    let collection;
    try {
      collection = await getCollection();
      const skip = (page - 1) * limit
      const categories = await collection.find({}).skip(skip).limit(limit).sort({ _id: -1 }).toArray();
      const total = await collection.countDocuments({});
      return { categories, total }
    } catch (err) {
      console.log('Error', err);
    }
  }

  // Common function to fetch user categories by type
  const getUserCategories = async (user, type, page = 1, limit = 12, search = "") => {
    try {
      const collection = await getCollection();
      page = Math.max(1, parseInt(page));
      limit = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (page - 1) * limit;

      const baseQuery = { user, type };
      const query = buildSearchQuery(baseQuery, search);

      const pipeline = [
        { $match: query },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      const [totalCount, categories] = await Promise.all([
        collection.countDocuments(query),
        collection.aggregate(pipeline).toArray()
      ]);

      return { total: totalCount, categories };
    } catch (err) {
      console.error(`Failed to fetch ${ type } categories:`, err);
      throw err;
    }
  };

  // Utility function to build search queries
  const buildSearchQuery = (baseQuery, search) => {
    if (!search) return baseQuery;

    const query = { ...baseQuery };
    query.$or = [
      { name: { $regex: search, $options: "i" } }
    ];

    const searchAsNumber = parseFloat(search);
    if (!isNaN(searchAsNumber)) {
      query.$or.push({ money: searchAsNumber });
    }

    return query;
  };

  // Example usage for different category types
  const getUserFundCategories = (user, page, limit, search) =>
    getUserCategories(user, "fund", page, limit, search);

  const getUserCostCategories = (user, page, limit, search) =>
    getUserCategories(user, "cost", page, limit, search);


  // Get single category by id
  const getCategoryByID = async (id) => {
    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      throw new Error('Invalid category ID');
    }
    let collection;
    try {
      collection = await getCollection();
      const categories = await collection.findOne({ _id: new ObjectId(id) });
      if (!categories) {
        throw new Error('Category not found');
      }
      return categories;
    } catch (err) {
      console.error('Failed to fetch category:', err);
      throw err;
    }
  }

  // Delete single category by id
  const deleteCategoryByID = async (id) => {
    let collection;
    try {
      collection = await getCollection();
      const categories = await collection.deleteOne({ _id: new ObjectId(id) });
      return categories
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw err;
    }
  }


  return {
    createCategory,
    getAllCategories,
    getCategoryByID,
    deleteCategoryByID,
    getUserFundCategories,
    updateCategory,
    getUserCostCategories
  }

}

module.exports = categoryModel;
