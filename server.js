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
