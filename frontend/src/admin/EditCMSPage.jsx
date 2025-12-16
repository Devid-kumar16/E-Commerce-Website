import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function EditCMSPage() {
  const { id } = useParams();
  const [content, setContent] = useState("");

  return (
    <div className="admin-main-content">
      <h2>Edit Page: {id}</h2>

      <textarea
        rows="10"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter page content..."
      />

      <br />
      <button className="btn btn-primary">Save</button>
    </div>
  );
}

