import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRegisterNotificationEmail,
  sendUpdateNotificationEmail,
} from "../services/emailNotification.js";
import Notification from "../models/Notification.js";
import Product from "../models/Product.js";

// desc    register
// route   POST /api/v1/users/register
// access  Private/Admin
export const registerUserController = asyncHandler(async (req, res) => {
  const { fullname, email, phone, password, role } = req.body;

  // check if user exist
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already Exists");
    return;
  }
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // create user
  const user = await User.create({
    fullname,
    email,
    phone,
    password: hashedPassword,
    role: role || "buyer",
  });

  // create notification
  const notification = await Notification.create({
    userId: user._id,
    message: `<p>
  Welcome to <strong>FarmLink</strong> – your trusted platform for buying and selling fresh farm produce!
</p>`,
  });
  if (user && user.email) {
    await sendRegisterNotificationEmail(user.email, user.fullname);
  }

  res.status(201).json({
    status: "success",
    message: "User Registered Successfully",
    data: user,
  });
});

// desc    login
// route   POST /api/v1/users/login
// access  Public

export const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exist in db
  const userFound = await User.findOne({
    email,
  });
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    res.json({
      status: "success",
      message: "Login Successfully",
      user: {
        _id: userFound._id,
        fullname: userFound.fullname,
        email: userFound.email,
        phone: userFound.phone,
        role: userFound.role,
        // add other fields as needed
      },
      token: generateToken(userFound?._id),
    });
  } else {
    throw new Error("Invalid Login Credentials");
  }
});

// desc    get user
// route   POST /api/v1/users/profile
// access  Private
export const getUserProfileController = asyncHandler(async (req, res) => {
  //find the user
  const user = await User.findById(req.userAuthId).populate([
    "orders",
    "vendorProfile",
  ]);
  res.json({
    status: "success",
    message: "User profile fetched successfully",
    user,
  });
});

// desc    get all users
// route   GET /api/v1/users
// access  Private/Admin
export const getAllUsersController = asyncHandler(async (req, res) => {
  // find all users
  const users = await User.find({})
    .select("-password")
    .sort("-createdAt")
    .populate("vendorProfile");
  res.json({
    status: "success",
    message: "Users fetched successfully",
    users,
  });
});

// desc    update user
// route   POST /api/v1/users/profile/:id
// access  Private
export const updateUserProfileController = asyncHandler(async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  // find user
  const user = await User.findById(req.userAuthId);
  if (!user) {
    throw new Error("User not found");
  } else {
    // Check if email is being updated and if it already exists for another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        throw new Error("Email already exists. Please use a different email.");
      }
      user.email = email;
    }
    // Check if phone is being updated and if it already exists for another user
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        throw new Error(
          "Phone number already exists. Please use a different phone number."
        );
      }
      user.phone = phone;
    }
    // Update user fields
    if (fullname) {
      user.fullname = fullname;
    }
    if (email) {
      user.email = email;
    }
    if (phone) {
      user.phone = phone;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // create notification
    const notification = await Notification.create({
      userId: user._id,
      message: `<p>Your email has been <strong>updated successfully</strong>.</p>`,
    });
    if (user && user.email) {
      await sendUpdateNotificationEmail(user.email, user.fullname);
    }
    await user.save();
    res.json({
      status: "success",
      message: "User profile updated successfully",
      user,
    });
  }
});

// @desc    Update user shipping address
// @route   PUT /api/v1/users/update/shipping
// @access  Private

export const updateShippingAddressController = asyncHandler(
  async (req, res) => {
    const {
      firstName,
      lastName,
      address,
      city,
      postalCode,
      province,
      phone,
      country,
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userAuthId,
      {
        shippingAddress: {
          firstName,
          lastName,
          address,
          city,
          postalCode,
          province,
          phone,
          country,
        },
        hasShippingAddress: true,
      },
      {
        new: true,
      }
    );
    //send response
    res.json({
      status: "success",
      message: "User shipping address updated successfully",
      user,
    });
  }
);

// desc    delete user
// route   POST /api/v1/users/profile/;id
// access  Private/Admin
export const deleteUserController = asyncHandler(async (req, res) => {
  // find user
  const user = await User.findById(req.userAuthId);
  if (!user) {
    throw new Error("User not found");
  } else {
    await user.deleteOne();
    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  }
});

// desc    block user
// route   put /api/v1/users/block/:userId
// access  Private/Admin
export const blockUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    { new: true }
  );

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  } else {
    res.json({
      status: "success",
      message: "User blocked successfully",
      username: user.fullname,
      isBlocked: user.isBlocked,
    });
  }
});

// desc    block user
// route   put /api/v1/users/block/:userId
// access  Private/Admin
export const unblockUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    { new: true }
  );

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  } else {
    res.json({
      status: "success",
      message: "User unblocked successfully",
      username: user.fullname,
      isBlocked: user.isBlocked,
    });
  }
});

// desc    verify email acc token
// route   POST /api/v1/users/verify-email
// access  Private
export const verifyEmailTokenController = asyncHandler(async (req, res) => {
  // find user
  const user = await User.findById(req.userAuthId);
  if (!user) {
    throw new Error("User not found, please login again");
  }

  // check if user email exists
  if (!user?.email) {
    throw new Error("User email not found");
  }

  const token = await user.generateAccountVerificationToken();
  // resave user
  await user.save();

  // send verification email
  await sendVerificationEmail(user?.email, token);

  res.json({
    token,
    status: "success",
    message:"Email verification token sent to your email and expires in 10 minutes",
  });
});

// desc    verify email acc
// route   POST /api/v1/users/verify-email/:verifyToken
// access  Private
export const verifyEmailAccountController = asyncHandler(async (req, res) => {
  const { verifyToken } = req.params;
  // convert token
  const cryptoToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  // find user
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Account verification token is invalid or has expired");
  }
  // update user account status
  userFound.isEmailVerified = true;
  userFound.accountVerificationToken = null;
  userFound.accountVerificationExpires = null;

  // If user is a vendor, activate their vendor profile
  if (userFound.vendorProfile) {
    const Vendor = (await import("../models/Vendor.js")).default;
    await Vendor.findByIdAndUpdate(userFound.vendorProfile, {
      status: "active",
    });
  }

  // resave user
  await userFound.save();
  res.json({
    status: "success",
    message: "Account verified successfully",
  });
});

// desc    forgot password sending token
// route   POST /api/v1/users/forgot-password
// access  Private
export const forgotPasswordController = asyncHandler(async (req, res) => {
  // get user email from req.body
  const { email } = req.body;
  // find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`User with email not found`);
  }

  const token = await user.generatePasswordResetToken();
  // resave user
  await user.save();

  // send verification email
  await sendPasswordResetEmail(user?.email, token);

  res.json({
    token,
    status: "success",
    message: `Password reset code sent to your email and expires in 10 minutes`,
  });
});

// desc    verify password reset token
// route   POST /api/v1/users/verify-password-reset/:resetToken
// access  Private
export const resetPasswordController = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  // check if password is provided
  if (!password) {
    throw new Error("Password is required");
  }
  // check if password is at least 8 characters long
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  // convert token into actual token that's in our DB
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // find user
  const userFound = await User.findOne({
    passwordResetToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Password reset token is invalid or has expired");
  }
  // update user field
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  userFound.password = hashedPassword;
  userFound.passwordResetToken = null;
  userFound.passwordResetExpires = null;

  // resave user
  await userFound.save();
  res.json({
    status: "success",
    message: "Password reset successfully",
  });
});

export const updateProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product Not Found");
  }

  // Only allow if the logged-in user is the creator
  if (product.user.toString() !== req.userAuthId.toString()) {
    throw new Error("You do not have permission to update this product");
  }

  // ...proceed with update logic
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product Not Found");
  }

  // Only allow if the logged-in user is the creator
  if (product.user.toString() !== req.userAuthId.toString()) {
    throw new Error("You do not have permission to delete this product");
  }

  await product.remove();
  res.json({ status: "success", message: "Product deleted successfully" });
});
