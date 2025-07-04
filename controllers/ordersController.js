import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { sendOrderUpdateNotificationEmail } from "../services/emailNotification.js";
import Notification from "../models/Notification.js";

// stripe initialization
const stripe = new Stripe(process.env.STRIPE_KEY);

// @desc       create orders
// @route      POST /api/v1/orders
// @Access     Public
export const createOrdersController = asyncHandler(async (req, res) => {
  // get coupon from query
  let discount = 0;
  let couponFound = null;
  const coupon = req?.query?.coupon;

  if (coupon) {
    couponFound = await Coupon.findOne({ code: coupon.toUpperCase() });
    if (!couponFound) {
      throw new Error("Coupon does not exist");
    }
    if (couponFound.isExpired) {
      throw new Error("Coupon is expired");
    }
    discount = couponFound.discount / 100;
  }

  // get discount
  // const discount = couponFound?.discount / 100;

  // get payload
  const { orderItems, shippingAddress, totalPrice } = req.body;
  // find user
  const user = await User.findById(req.userAuthId);
  // check if has a shipping address
  if (!user?.hasShippingAddress) {
    throw new Error("Shipping address is required");
  }

  if (orderItems?.length <= 0) {
    throw new Error("No order items found");
  }

  // create order
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
  });

  // update product qty
  const products = await Product.find({ _id: { $in: orderItems } });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });

  user.orders.push(order?._id);
  await user.save();

  // convert orders to stripe format
  const convertedOrders = orderItems?.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.price * 100, // Convert to cents
      },
      quantity: item.qty,
    };
  });
  // create stripe payment
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
      userId: JSON.stringify(user?._id),
    },
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.send({ url: session.url });
});

// @desc       get all orders
// @route      GET /api/v1/orders/
// @Access     Private
export const getAllOrdersController = asyncHandler(async (req, res) => {
  // find all orders
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  if (!orders) {
    throw new Error("No orders found");
  }
  res.json({
    success: true,
    message: "Orders fetched successfully",
    orders,
  });
});

// @desc       get a single order
// @route      GET /api/v1/orders/:id
// @Access     Private

export const getSingleOrderController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // find order
  const order = await Order.findById(id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price image");

  if (!order) {
    throw new Error("Order not found");
  }
  res.json({
    success: true,
    message: "Order fetched successfully",
    order,
  });
});

// @desc       updating order status
// @route      GET /api/v1/orders/update/:id
// @Access     Private/Admin
export const updateOrderController = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  // send email notification to user
  const user = await User.findById(updatedOrder.user);
  if (user) {
    const messageText = `Your order #${updatedOrder._id} status has been updated to ${req.body.status}.`;
    sendOrderUpdateNotificationEmail(user.email, updatedOrder._id, messageText);
  }

  // create notification for the user
  await Notification.create({
    userId: updatedOrder.user,
    message: `Your order #${updatedOrder.orderNumber} status has been updated to <strong>${req.body.status}</strong>.`,
  });

  res.json({
    success: true,
    message: "Order updated successfully",
    updatedOrder,
  });
});

// @desc       get sales sum of orders
// @route      GET /api/v1/orders/sales/sum
// @Access     Private/Admin
export const getOrderStatisticsController = asyncHandler(async (req, res) => {
  // get minimum and maximum date
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maximumSale: {
          $max: "$totalPrice",
        },
        averageSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  const date = new Date();
  const today = new Date(date.getFullYear(), (date.getMonth(), date.getDate));
  const salesToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Sales sum fetched successfully",
    orders,
    salesToday,
    // totalSales: sumOfTotalSales[0]?.totalSales || 0,
  });
});
