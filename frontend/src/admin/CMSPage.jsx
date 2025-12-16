import React from "react";
import { Link } from "react-router-dom";

export default function CMSPages() {
  return (
    <div className="admin-main-content">
      <h2>CMS Pages</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Slug</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>About Us</td>
            <td>/about</td>
            <td>
              <Link to="/admin/cms/pages/about" className="btn btn-primary">
                Edit
              </Link>
            </td>
          </tr>

          <tr>
            <td>Privacy Policy</td>
            <td>/privacy</td>
            <td>
              <Link to={`/admin/cms/pages/${page.id}/edit`}>
                Edit
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
