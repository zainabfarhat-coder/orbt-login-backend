import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (_req, res) => {
  const members = await User.find({ role: "user" })
    .select("email role createdAt")
    .sort({ createdAt: -1 });

  res.json(
    members.map((m) => ({
      id: m.id,
      email: m.email,
      role: m.role,
      createdAt: m.createdAt,
    }))
  );
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || String(password).length < 6) {
    res.status(400).json({
      error: "Email and a password of at least 6 characters are required",
    });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(String(password), 10);
    const member = await User.create({
      email,
      passwordHash,
      role: "user",
    });

    res.status(201).json({
      id: member.id,
      email: member.email,
      role: member.role,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "A member with this email already exists" });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

export default router;