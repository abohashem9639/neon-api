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

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT id, password, user_role FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rowCount === 0) {
      return res.json({ success: false, message: "رقم الهاتف أو كلمة المرور غير صحيحة." });
    }

    const user = userResult.rows[0];
    
    // تحقق من كلمة المرور (افترض أن كلمات المرور مخزنة مشفرة باستخدام bcrypt)
    const bcrypt = require("bcrypt");
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.json({ success: false, message: "رقم الهاتف أو كلمة المرور غير صحيحة." });
    }

    // بناء استجابة مع معلومات إضافية حسب الدور (يمكن تعديل حسب حاجتك)
    let extraInfo = {};
    if (user.user_role === "admin") {
      const mgrRes = await pool.query(
        "SELECT restaurant_id FROM managers WHERE user_id = $1",
        [user.id]
      );
      extraInfo.restaurant_id = mgrRes.rows[0]?.restaurant_id || null;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        user_role: user.user_role,
        ...extraInfo
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "حدث خطأ في الخادم." });
  }
});
