import { Link } from "react-router-dom";

export default function CMSDashboard() {
  return (
    <div className="admin-main-content">
      <h2>CMS Dashboard</h2>
      <p>Manage pages, banners, and static content</p>

      <Link to="/admin/cms/pages" className="btn btn-primary">
        Manage Pages
      </Link>
    </div>
  );
}
