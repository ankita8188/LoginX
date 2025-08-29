import express from "express";
import passport from "passport";

const router = express.Router();

// Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
    session: false,
  }),
  (req, res) => {
    const token = req.user.token; // ✅ Now defined
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

export default router;
