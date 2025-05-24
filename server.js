const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express(); // ← تعريف app هنا
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://Quick_owner:npg_n35zUiDIqCeR@ep-black-heart-a91mu0zf-pooler.gwc.azure.neon.tech/Quick?sslmode=require",
});

// ✅ المسار الديناميكي لجلب أي جدول
app.get("/table/:name", async (req, res) => {
  const tableName = req.params.name;

  const allowedTables = [
    "users",
    "orders",
    "menu_items",
    "ratings",
    "restaurants",
    "customers_history",
    "favorite_restaurants",
    "general_users",
    "managers",
    "optional_ingredients",
    "order_items",
    "product_ingredients",
    "promotion_products",
    "promotions",
    "restaurant_ratings",
    "sales_analytics",
    "superadmins"
  ];

  if (!allowedTables.includes(tableName)) {
    return res.status(403).json({ error: "Access to this table is not allowed" });
  }

  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving table" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
