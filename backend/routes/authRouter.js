import express from "express";
import passport from "passport";

const router = express.Router();

// Step 1: Redirect to Google for login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
  }
);

export default router;
