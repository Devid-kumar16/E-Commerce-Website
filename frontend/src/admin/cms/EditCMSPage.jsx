import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./CMSStyles.css";

export default function EditCMSPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "Draft",
    seo_title: "",
    seo_description: "",
    updated_at: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* ================= LOAD PAGE ================= */
  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/cms/pages/${id}`);

        // ✅ SUPPORT BOTH RESPONSE FORMATS (SAFE)
        const page = res.data?.page || res.data;

        if (!page) {
          throw new Error("Page not found");
        }

        if (mounted) {
          setForm({
            title: page.title || "",
            slug: page.slug || "",
            content: page.content || "",
            status: page.status || "Draft",
            seo_title: page.seo_title || "",
            seo_description: page.seo_description || "",
            updated_at: page.updated_at || null,
          });
        }
      } catch (err) {
        console.error("Failed to load page", err);
        if (mounted) setError("Page not found or failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPage();
    return () => (mounted = false);
  }, [id]);

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put(`/cms/pages/${id}`, form);

      setForm((prev) => ({
        ...prev,
        updated_at: new Date().toISOString(),
      }));

      setMessage("Page updated successfully");
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  /* ================= PREVIEW ================= */
  const handlePreview = () => {
    if (!form.slug) {
      alert("Please add a slug before previewing");
      return;
    }
    window.open(`/page/${form.slug}`, "_blank");
  };

  /* ================= STATES ================= */
  if (loading) return <p className="cms-loading">Loading page...</p>;

  if (error)
    return (
      <div className="cms-error">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/cms/pages")}>
          Back to Pages
        </button>
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="cms-edit-layout">
      {/* LEFT COLUMN */}
      <form className="cms-edit-main" onSubmit={handleSubmit}>
        <h2>Edit Page</h2>

        <label>Page Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <label>Slug</label>
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />

        <label>Content</label>
        <textarea
          rows="12"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />

        <div className="cms-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="cms-preview-btn"
            onClick={handlePreview}
          >
            Preview Page
          </button>
        </div>

        {message && <div className="cms-toast success">{message}</div>}
        {error && <div className="cms-toast error">{error}</div>}

        {form.updated_at && (
          <small className="cms-last-saved">
            Last saved: {new Date(form.updated_at).toLocaleString()}
          </small>
        )}
      </form>

      {/* RIGHT COLUMN */}
      <aside className="cms-edit-sidebar">
        <h3>Page Settings</h3>

        <label>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>

        <hr />

        <h4>SEO</h4>

        <label>SEO Title</label>
        <input
          value={form.seo_title}
          onChange={(e) =>
            setForm({ ...form, seo_title: e.target.value })
          }
        />

        <label>SEO Description</label>
        <textarea
          rows="4"
          value={form.seo_description}
          onChange={(e) =>
            setForm({ ...form, seo_description: e.target.value })
          }
        />
      </aside>
    </div>
  );
}
