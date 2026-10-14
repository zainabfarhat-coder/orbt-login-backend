import "dotenv/config";
import mongoose from "mongoose";
import { Brand } from "./models/Brand";

const BRANDS = [
  {
    name: "Nike",
    price: 45,
    description: "Sportswear and sneakers for training, running and everyday wear.",
  },
  {
    name: "Adidas",
    price: 60,
    description: "Sports clothing and footwear, from the track to the street.",
  },
  {
    name: "Puma",
    price: 30,
    description: "Athletic and casual shoes and apparel with a sporty style.",
  },
  {
    name: "Reebok",
    price: 50,
    description: "Fitness footwear and apparel made for workouts.",
  },
  {
    name: "Zara",
    price: 39,
    description: "Modern fashion clothing for women, men and kids.",
  },
  {
    name: "Hermes",
    price: 300,
    description: "A luxury fashion house known for leather goods and accessories.",
  },
];

async function seedBrands() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in .env");

  await mongoose.connect(uri);

  for (const brand of BRANDS) {
    await Brand.findOneAndUpdate({ name: brand.name }, brand, { upsert: true });
  }

  console.log("Brands ready:", BRANDS.length);
  await mongoose.disconnect();
}

seedBrands().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});