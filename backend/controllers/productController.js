import { pool } from "../config/db.js";
import ProductModel from "../models/Product.js";

/* ================= PUBLIC PRODUCTS ================= */
export async function listPublicProducts(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        price,
        image_url,
        category_id
      FROM products
      WHERE status = 'published'
        AND (active = 1 OR active IS NULL)
      ORDER BY id DESC
      LIMIT 20
    `);

    res.json({
      ok: true,
      products: rows,
    });
  } catch (err) {
    console.error("listPublicProducts error:", err);
    res.status(500).json({
      ok: false,
      products: [],
      message: "Failed to load products",
    });
  }
}



/* ================= ADMIN PRODUCTS ================= */
export async function listAdminProducts(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.image_url,
        p.price,
        p.status,
        p.active,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);

    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load products" });
  }
}

/* ================= SINGLE PRODUCT ================= */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        name,
        price,
        status,
        stock,
        image_url,
        description,
        category
      FROM products
      WHERE id = ?
        AND status = 'published'
        AND active = 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    res.json({
      ok: true,
      product: rows[0],
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load product",
    });
  }
}


/* ================= CREATE PRODUCT ================= */
export async function createProduct(req, res) {
  try {
    const { name, price, status, category_id, image_url } = req.body;

    await pool.query(
      `INSERT INTO products (name, price, status, category_id, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, price, status, category_id, image_url || null]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      price,
      status,
      category_id,
      stock,          // ✅ READ STOCK
      image_url,
      description,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({
        ok: false,
        message: "Invalid stock value",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE products
      SET
        name = ?,
        price = ?,
        status = ?,
        category_id = ?,
        stock = ?,          -- ✅ CRITICAL FIX
        image_url = ?,
        description = ?
      WHERE id = ?
      `,
      [
        name,
        price,
        status,
        category_id,
        Number(stock),
        image_url || null,
        description || "",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    res.json({
      ok: true,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to update product",
    });
  }
}


/* ================= DELETE PRODUCT ================= */
export async function deleteProduct(req, res, next) {
  try {
    await ProductModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// /* ================= INVENTORY ================= */
// export async function updateInventory(req, res, next) {
//   try {
//     const stock = Number(req.body.stock);

//     if (Number.isNaN(stock) || stock < 0) {
//       return res.status(400).json({
//         ok: false,
//         message: "Invalid stock value",
//       });
//     }

//     const product = await ProductModel.setInventory(
//       req.params.id,
//       stock
//     );

//     if (!product) {
//       return res.status(404).json({
//         ok: false,
//         message: "Product not found",
//       });
//     }

//     res.json({
//       ok: true,
//       product,
//     });
//   } catch (err) {
//     next(err);
//   }
// }


/* ===================================================
   ✅ CATEGORY PRODUCTS (FIXED & FINAL)
   URL: /api/products/category/:slug
=================================================== */
export async function getProductsByCategory(req, res) {
  try {
    let { slug } = req.params;

    // normalize URL slug
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "")
      .trim();

    // 1️⃣ Find category using SQL normalization
    const [categories] = await pool.query(
      `
      SELECT id, name
      FROM categories
      WHERE REPLACE(
              REPLACE(
                REPLACE(LOWER(name), '&', 'and'),
              ' ', ''),
            's', ''
          ) =
          REPLACE(?, 's', '')
      `,
      [normalizedSlug]
    );

    if (!categories.length) {
      return res.json({
        ok: true,
        category: null,
        products: [],
      });
    }

    const category = categories[0];

    // 2️⃣ Fetch products using category_id
    const [products] = await pool.query(
      `
      SELECT 
        id,
        name,
        price,
        image_url,
        stock,
        slug
      FROM products
      WHERE category_id = ?
        AND status = 'published'
        AND active = 1
      ORDER BY id DESC
      `,
      [category.id]
    );

    res.json({
      ok: true,
      category,
      products,
    });
  } catch (err) {
    console.error("getProductsByCategory error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load category products",
    });
  }
}



/* ---------- PUBLISH / UNPUBLISH ---------- */
export async function publishToggle(req, res, next) {
  try {
    const published =
      req.body.published === true ||
      req.body.published === "true" ||
      req.body.published === 1;

    const product = await ProductModel.setPublished(
      req.params.id,
      published
    );

    res.json(product);
  } catch (err) {
    next(err);
  }
}


/* ================= ADMIN: SINGLE PRODUCT ================= */
export async function getProductAdmin(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.status,
        p.stock,
        p.inventory,
        p.image_url,
        p.description,
        p.category_id
      FROM products p
      WHERE p.id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    res.json({
      ok: true,
      product: rows[0],
    });
  } catch (err) {
    console.error("getProductAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load product",
    });
  }
}
