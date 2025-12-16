import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/categories", { name, status });
    navigate("/admin/categories");
  };

  return (
    <div className="form-page">
      <h1>Add Category</h1>

      <form onSubmit={submit} className="form-card">
        <label>Category Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="actions">
          <button className="btn btn-primary">Save</button>
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
