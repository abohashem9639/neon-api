const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// إعداد اتصال بقاعدة Neon PostgreSQL
const pool = new Pool({
  connectionString: "postgresql://Quick_owner:npg_n35zUiDIqCeR@ep-black-heart-a91mu0zf-pooler.gwc.azure.neon.tech/Quick?sslmode=require",
});

// قائمة الجداول المسموح بالوصول لها عبر API
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

// مسار لاسترجاع جميع البيانات من جدول معين (مع التحقق من صلاحية الجدول)
app.get("/table/:name", async (req, res) => {
  const tableName = req.params.name;

  if (!allowedTables.includes(tableName)) {
    return res.status(403).json({ error: "Access to this table is not allowed" });
  }

  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error retrieving table:", err);
    res.status(500).json({ error: "Error retrieving table" });
  }
});

// مسار تسجيل الدخول
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: "Phone and password are required." });
  }

  try {
    // جلب المستخدم حسب رقم الهاتف
    const userResult = await pool.query(
      "SELECT id, password, user_role FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rowCount === 0) {
      return res.json({ success: false, message: "رقم الهاتف أو كلمة المرور غير صحيحة." });
    }

    const user = userResult.rows[0];

    // التحقق من كلمة المرور باستخدام bcrypt
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.json({ success: false, message: "رقم الهاتف أو كلمة المرور غير صحيحة." });
    }

    // معلومات إضافية حسب الدور
    let extraInfo = {};
    if (user.user_role === "admin") {
      const mgrRes = await pool.query(
        "SELECT restaurant_id FROM managers WHERE user_id = $1",
        [user.id]
      );
      extraInfo.restaurant_id = mgrRes.rows[0]?.restaurant_id || null;
    }

    // إرسال الرد مع بيانات المستخدم
    res.json({
      success: true,
      user: {
        id: user.id,
        user_role: user.user_role,
        ...extraInfo
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "حدث خطأ في الخادم." });
  }
});

// بدء الخادم على المنفذ المناسب
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
