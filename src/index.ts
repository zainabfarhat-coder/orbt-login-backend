import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import memberRoutes from "./routes/members";
import orderRoutes from "./routes/orders";
import brandRoutes from "./routes/brands";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/members", memberRoutes);
app.use("/orders", orderRoutes);
app.use("/brands", brandRoutes);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in .env");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Backend running on port " + port));
}

start().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});