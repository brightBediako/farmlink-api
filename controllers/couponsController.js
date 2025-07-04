import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
// @desc    Create new Coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin

export const createCouponController = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  //check if coupon already exists
  const couponsExists = await Coupon.findOne({
    code,
  });
  if (couponsExists) {
    throw new Error("Coupon already exists");
  }
  //check if discount is a number
  if (isNaN(discount)) {
    throw new Error("Discount value must be a number");
  }
  //create coupon
  const coupon = await Coupon.create({
    code: code?.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.userAuthId,
  });
  //send the response
  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    coupon,
  });
});

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin

export const getAllCouponsController = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: "success",
    message: "All coupons",
    coupons,
  });
});
// @desc    Get single coupon
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin

export const getSingleCouponController = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById( req.params.id );
  if (!coupon) {
    throw new Error("Coupon not found");
  }
  
  res.json({
    status: "success",
    message: "Coupon fetched",
    coupon,
  });
});

export const updateCouponController = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: code?.toUpperCase(),
      discount,
      startDate,
      endDate,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "Coupon updated successfully",
    coupon,
  });
});

export const deleteCouponController = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Coupon deleted successfully",
    coupon,
  });
});
