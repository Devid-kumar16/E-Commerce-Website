import { Link } from "react-router-dom";
import "./CMSStyles.css";

export default function CMSDashboard() {
  return (
    <div className="cms-container">
      <div className="cms-header">
        <h1>Content Management</h1>
        <p>Manage website content, pages and configurations</p>
      </div>

      <div className="cms-grid">
        {/* Pages */}
        <div className="cms-card">
          <h3>📄 Pages</h3>
          <p>
            Manage static pages like <b>About Us</b>, <b>Privacy Policy</b>,{" "}
            <b>Terms & Conditions</b>.
          </p>
          <Link to="/admin/cms/pages" className="cms-btn">
            Manage Pages →
          </Link>
        </div>

        {/* SEO */}
        <div className="cms-card">
          <h3>🔍 SEO</h3>
          <p>Control meta titles, descriptions and keywords.</p>
          <Link to="/admin/cms/seo" className="cms-btn secondary">
            Manage SEO →
          </Link>
        </div>

        {/* Banners */}
        <div className="cms-card">
          <h3>🖼 Banners</h3>
          <p>Manage homepage banners and promotional sliders.</p>
          <Link to="/admin/cms/banners" className="cms-btn secondary">
            Manage Banners →
          </Link>
        </div>
      </div>
    </div>
  );
}
