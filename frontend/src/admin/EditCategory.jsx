import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  /* LOAD CATEGORY */
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await api.get(`/categories/${id}`);
        setName(res.data.name);
        setImageUrl(res.data.image_url || "");
        setStatus(res.data.status);
      } catch (err) {
        alert("Failed to load category");
        navigate("/admin/categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id, navigate]);

  /* UPDATE CATEGORY */
  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/categories/${id}`, {
        name,
        image_url: imageUrl,
        status,
      });

      navigate("/admin/categories");
    } catch (err) {
      alert("Failed to update category");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-page">
      <h1>Edit Category</h1>

      <form onSubmit={submit} className="form-card">
        <label>Category Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="actions">
          <button className="btn btn-primary">Update</button>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
