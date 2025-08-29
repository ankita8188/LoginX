import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./dbconnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import { removeUnverifiedAccounts } from "./auutomation/removeUnverifiedAccounts.js"; 

// 🟢 IMPORTANT: import passport config here
import "./passport.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/api/v1/user", userRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("✅ Backend running!");
});

// Background job
removeUnverifiedAccounts();

// Database connection
connection();

// Error middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
