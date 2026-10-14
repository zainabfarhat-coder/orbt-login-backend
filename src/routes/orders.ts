import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order";
import { Brand } from "../models/Brand";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const STATUSES = ["pending", "approved", "rejected"];

router.use(requireAuth);

function toJson(o: any) {
  return {
    id: o.id,
    brandName: o.brand,
    price: o.price,
    quantity: o.qty,
    total: o.price * o.qty,
    date: new Date(o.createdAt).toISOString().split("T")[0],
    status: o.status,
    ownerEmail: o.user?.email,
    ownerId: o.user?.id,
  };
}

router.get("/", async (_req, res) => {
  const { id, role } = res.locals.user;
  const filter = role === "admin" ? {} : { user: id };

  const orders = await Order.find(filter)
    .populate("user", "email")
    .sort({ createdAt: -1 });

  res.json(orders.map(toJson));
});

router.post("/", async (req, res) => {
  const { brandName, quantity } = req.body;
  const qtyNum = Number(quantity);

  if (!Number.isInteger(qtyNum) || qtyNum < 1) {
    res.status(400).json({ error: "Quantity must be a whole number of at least 1" });
    return;
  }

  const brand = await Brand.findOne({ name: brandName });
  if (!brand) {
    res.status(400).json({ error: "Unknown brand" });
    return;
  }

  const order = await Order.create({
    user: res.locals.user.id,
    brand: brand.name,
    price: brand.price,
    qty: qtyNum,
  });
  await order.populate("user", "email");

  res.status(201).json(toJson(order));
});

router.post("/checkout", async (req, res) => {
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    res.status(400).json({ error: "Your cart is empty" });
    return;
  }

  const lines: { brand: string; price: number; qty: number }[] = [];

  for (const item of items) {
    const qtyNum = Number(item?.quantity);
    if (!Number.isInteger(qtyNum) || qtyNum < 1) {
      res.status(400).json({ error: "Each quantity must be a whole number of at least 1" });
      return;
    }

    const brand = await Brand.findOne({ name: item?.brandName });
    if (!brand) {
      res.status(400).json({ error: `Unknown brand: ${item?.brandName}` });
      return;
    }

    lines.push({ brand: brand.name, price: brand.price, qty: qtyNum });
  }

  const created = await Order.insertMany(
    lines.map((l) => ({ ...l, user: res.locals.user.id }))
  );

  res.status(201).json({ count: created.length });
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    res.status(400).json({ error: "Status must be pending, approved or rejected" });
    return;
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate("user", "email");

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(toJson(order));
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const order = await Order.findById(req.params.id).populate("user", "email");
  const { id, role } = res.locals.user;

  if (!order || (role !== "admin" && (order.user as any).id !== id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(toJson(order));
});

export default router;