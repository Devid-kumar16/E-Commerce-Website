import api from "./client";

/* =====================================================
   ✅ PUBLIC: Get All Published Products
===================================================== */
export const getProducts = async () => {
  try {
    const res = await api.get("/products");

    if (Array.isArray(res.data?.products)) {
      return res.data.products;
    }

    console.warn("Unexpected products API response:", res.data);
    return [];
  } catch (err) {
    console.error("Error loading products:", err);
    return [];
  }
};


/* =====================================================
   ✅ PUBLIC: Get Single Product by ID
===================================================== */
export const getProduct = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);

    if (res.data?.product) return res.data.product;

    console.warn("Unexpected single product response:", res.data);
    return null;
  } catch (err) {
    console.error("Error loading product:", err);
    return null;
  }
};


/* =====================================================
   ✅ ADMIN: Create Product
===================================================== */
export const createProduct = async (data) => {
  try {
    const res = await api.post("/products/admin", data);
    return res.data;
  } catch (err) {
    console.error("Create product error:", err);
    throw err;
  }
};


/* =====================================================
   ✅ ADMIN: Update Product (PERMANENT FIXED ROUTE)
   Backend route: PUT /api/products/admin/:id
===================================================== */
export const updateProduct = async (id, data) => {
  try {
    const res = await api.put(`/products/admin/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Update product error:", err);
    throw err;
  }
};


/* =====================================================
   ✅ ADMIN: Delete Product
   Backend route: DELETE /api/products/admin/:id
===================================================== */
export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/products/admin/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete product error:", err);
    throw err;
  }
};
