import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message = "Login successful") => {
  try {
    // 1️⃣ Generate JWT Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" } // e.g. 7 days
    );

    // 2️⃣ Send cookie options
    const options = {
      expires: new Date(
        Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000 // default 7 days
      ),
      httpOnly: true,  // prevents JS access
      secure: process.env.NODE_ENV === "production", // only https in prod
      sameSite: "strict",
    };

    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({
        success: true,
        message,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          accountVerified: user.accountVerified,
        },
      });
  } catch (error) {
    console.error("❌ sendToken error:", error);
    res.status(500).json({
      success: false,
      message: "Token generation failed",
    });
  }
};
