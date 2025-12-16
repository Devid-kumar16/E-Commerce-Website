import React from "react";
import { Link } from "react-router-dom";

export default function CMSPages() {
  return (
    <div className="admin-page">
      <h2>CMS Pages</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Page Name</th>
            <th>Slug</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>About Us</td>
            <td>/about</td>
            <td>
              <Link to="/admin/cms/pages/1/edit" className="btn btn-primary">
                Edit
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
