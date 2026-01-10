import pool from "../config/db.js";
import ProductModel from "../models/Product.js";
import slugify from "slugify";


/* ================= PUBLIC PRODUCTS ================= */
export const listPublicProducts = async (req, res) => {
  const [products] = await pool.query(
    `
    SELECT *
    FROM products
    WHERE status = 'published'
    ORDER BY id DESC
    `
  );

  res.json({ products });
};





/* ================= ADMIN PRODUCTS ================= */
export const listAdminProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.image_url,
        p.price,
        p.status,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
      `
    );

    res.json({ ok: true, products });
  } catch (err) {
    console.error("listAdminProducts error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};


/* ================= SINGLE PRODUCT ================= */
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [[product]] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        p.status,
        p.image_url,
        p.description,
        p.category_id
      FROM products p
      WHERE p.id = ?
      `,
      [id]
    );

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    res.json({
      ok: true,
      product,
    });
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load product",
    });
  }
};






/* ================= CREATE PRODUCT ================= */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category_id,
      status,
      stock,
      image_url,
      description,
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    await pool.query(
      `
      INSERT INTO products (
        name,
        slug,
        description,
        price,
        stock,
        image_url,
        status,
        category_id,
        admin_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        slug,
        description || "",
        price,
        stock,
        image_url || null,
        status || "draft",
        category_id,
        req.user.id,
      ]
    );

    res.json({
      ok: true,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to add product",
    });
  }
};



/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      category_id,
      status,
      stock,
      image_url,
      description,
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    await pool.query(
      `
      UPDATE products
      SET
        name = ?,
        slug = ?,
        description = ?,
        price = ?,
        stock = ?,
        image_url = ?,
        status = ?,
        category_id = ?
      WHERE id = ?
      `,
      [
        name,
        slug,
        description || "",
        price,
        stock,
        image_url || null,
        status,
        category_id,
        id,
      ]
    );

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
};




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
export const getProductsByCategory = async (req, res) => {
  const { slug } = req.params;

  const [[category]] = await pool.query(
    `SELECT id, name FROM categories WHERE slug = ?`,
    [slug]
  );

  if (!category) {
    return res.json({ category: null, products: [] });
  }

  const [products] = await pool.query(
    `
    SELECT *
    FROM products
    WHERE category_id = ?
      AND status = 'published'
    `,
    [category.id]
  );

  res.json({ category, products });
};





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

export const getAdminProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const [products] = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.status,
        p.image_url,
        p.stock,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    res.json({
      ok: true,
      products,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin products error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load products",
    });
  }
};

