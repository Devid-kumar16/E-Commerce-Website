import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function PageBySlug() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await api.get(`/cms/pages/slug/${slug}`);
        setPage(res.data?.page || res.data);
      } catch (err) {
        setPage(null);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        Loading page...
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>Page not found</h2>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", padding: "60px 0" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "50px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* PAGE TITLE */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#111827",
          }}
        >
          {page.title}
        </h1>

        {/* DIVIDER */}
        <div
          style={{
            width: "60px",
            height: "4px",
            background: "#0ea5e9",
            marginBottom: "30px",
            borderRadius: "4px",
          }}
        />

        {/* PAGE CONTENT */}
        <div
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: "#374151",
            whiteSpace: "pre-line",
          }}
        >
          {page.content}
        </div>
      </div>
    </div>
  );
}
