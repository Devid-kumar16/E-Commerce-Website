import { Link } from "react-router-dom";
import "./CMSStyles.css";

const PAGES = [
  { id: 1, title: "About Us", slug: "about" },
  { id: 2, title: "Privacy Policy", slug: "privacy-policy" },
  { id: 3, title: "Terms & Conditions", slug: "terms" },
];

export default function CMSPages() {
  return (
    <div className="cms-container">
      <div className="cms-header">
        <h1>Pages</h1>
        <p>Edit and manage website static pages</p>
      </div>

      <div className="cms-page-list">
        {PAGES.map((page) => (
          <div key={page.id} className="cms-page-card">
            <div>
              <h4>{page.title}</h4>
              <small>{page.slug}</small>
            </div>

            <Link
              to={`/admin/cms/pages/${page.id}/edit`}
              className="cms-btn small"
              
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
