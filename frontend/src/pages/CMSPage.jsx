import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function CMSPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/cms/public/${slug}`).then((res) => {
      setPage(res.data.page);
    });
  }, [slug]);

  if (!page) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h1>{page.title}</h1>
      <div style={{ marginTop: "20px", lineHeight: "1.7" }}>
        {page.content}
      </div>
    </div>
  );
}
