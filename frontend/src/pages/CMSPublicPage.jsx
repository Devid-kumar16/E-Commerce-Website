import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CMSPublicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/page/${slug}`).then(res => setPage(res.data));
  }, [slug]);

  if (!page) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>{page.title}</h1>
      <div>{page.content}</div>
    </div>
  );
}
