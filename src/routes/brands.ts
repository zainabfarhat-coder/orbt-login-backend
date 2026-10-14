import { Router } from "express";
import mongoose from "mongoose";
import { Brand } from "../models/Brand";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

function toJson(b: any) {
  return {
    id: b.id,
    name: b.name,
    price: b.price,
    description: b.description,
  };
}

router.get("/", async (_req, res) => {
  const brands = await Brand.find().sort({ name: 1 });
  res.json(brands.map(toJson));
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Brand not found" });
    return;
  }

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404).json({ error: "Brand not found" });
    return;
  }

  res.json(toJson(brand));
});

export default router;