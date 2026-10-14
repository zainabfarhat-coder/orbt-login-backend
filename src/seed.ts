import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";

async function seed() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri || !email || !password) {
    throw new Error("MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const normalizedEmail = email.toLowerCase().trim();

  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, passwordHash, role: "admin" },
    { upsert: true }
  );

  console.log("Admin ready:", normalizedEmail);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});