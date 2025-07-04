import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// desc     create new category
// route    Post /api/v1/categories
// access   Private/admin
export const createCategoryController = asyncHandler(async (req, res) => {
  const { name } = req.body;
  //category exists
  const categoryFound = await Category.findOne({ name });
  if (categoryFound) {
    throw new Error("Category already exists");
  }
  //create
  const category = await Category.create({
    name: name?.toLowerCase(),
    user: req.userAuthId,
    image: req?.file?.path,
  });

  res.json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

// desc     get all categories
// route    Post /api/v1/categories
// access   Public
export const getCategoryController = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.json({
    status: "success",
    message: "Categories Fetched Successfully",
    categories,
  });
});

// desc     get a single category
// route    Post /api/v1/categories/:id
// access   Public

export const getSingleCategoryController = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.json({
    status: "success",
    message: "Category fetched successfully",
    category,
  });
});

// desc     update category
// route    Post /api/v1/categories/:id
// access   private
export const updateCategoryController = asyncHandler(async (req, res) => {
  const { name } = req.body;

  //update
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "category updated successfully",
    category,
  });
});

// desc     delete product
// route    Post /api/v1/products/:id
// access   private/admin
export const deleteCategoryController = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Category deleted successfully",
  });
});
