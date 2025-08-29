import { ErrorHandler } from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";


import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
import crypto from "crypto"
import { sendToken } from "../utils/sendToken.js";
dotenv.config();



export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, phone, password, verificationMethod } = req.body;

    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return next(
        new ErrorHandler("Invalid phone number format. Use +91XXXXXXXXXX", 400)
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email, accountVerified: true }, { phone, accountVerified: true }],
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or email already used.", 400));
    }

    // Create new user
    const user = await User.create({ name, email, phone, password });

    const verificationCode = await user.generateVerificationCode();
    await user.save();

    // ✅ Pass res into sendVerificationCode
    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      email,
      phone,
      res
    );
  } catch (error) {
    next(error);
  }
});


async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  email,
  phone,
  res
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);

      await sendEmail({
        email,
        subject: "Your Verification Code",
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid verification method",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;"> 
     <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">Verification Code</h2>
     <p style="font-size: 16px; color: #333;">Dear User,</p> 
     <p style="font-size: 16px; color: #333;">Your verification code is:</p> 
     <div style="text-align: center; margin: 20px 0;"> 
       <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px;"> 
       ${verificationCode} </span> 
     </div> 
     <p style="font-size: 16px; color: #333;">
       This code will expire in <strong>10 minutes</strong>.
     </p> 
     <p style="font-size: 16px; color: #333;">
       If you did not request this, please ignore this email.
     </p> 
     <p style="margin-top: 30px; font-size: 16px; color: #333;">
       Thank you,<br>Your Company Team
     </p> 
     <footer style="margin-top: 20px; text-align: center;"> 
       <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply.</p> 
     </footer> 
   </div>`;
}


export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    });
  }

  // Find the most recent unverified user
  const user = await User.findOne({ accountVerified: false }).sort({ createdAt: -1 });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "No unverified user found",
    });
  }

  // Check OTP
  if (user.verificationCode !== Number(otp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // Check if OTP expired
  if (Date.now() > new Date(user.verificationCodeExpire).getTime()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired",
    });
  }

  // Verify user
  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  // Send JWT token
  sendToken(user, 200, res);
});


export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password); // <-- instance method

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  sendToken(user, 200, res);
});

export const logout=catchAsyncError(async (req,res,next)=>{
  res.status(200).cookie("token","",{
    expires:new Date(Date.now()),
    httpOnly:true,
  }).json({
    success:true,
    message:"Logged out successfully"
  })
})

export const getUser=catchAsyncError(async (req,res,next)=>{
  const user=req.user;
  console.log(user);
  res.status(200).json({
    success:true,
    user,
  })
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `http://localhost:3000/resetpassword/${resetToken}`;
  const message = `Your password reset link: \n\n ${resetPasswordUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });

    res.status(200).json({ success: true, message: `Email sent to ${user.email}` });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  console.log('hello')
  console.log(req.params.token)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

const user = await User.findOne({
  resetPasswordToken,
  resetPasswordExpire: { $gt: Date.now() },
}).select("+password");   // ✅ explicitly include password


  console.log(user)

  if (!user) {
    return next(new ErrorHandler("Reset Password Token is invalid or expired", 400));
  }

   console.log(req.body.password)    
   console.log(req.body.confirmPassword)    

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  console.log(req.body.password)    
  console.log(user.password)    
  user.password = req.body.password;    
  console.log(user.password)    
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  console.log("done")

  await user.save();

  res.status(200).json({ success: true, message: "Password Reset Successful" });
});