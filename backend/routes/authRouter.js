import express from "express";
import passport from "passport";

const router = express.Router();

// Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.token; // ✅ Now defined
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

export default router;
