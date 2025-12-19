import "./CMSStyles.css";

export default function CMSEO() {
  return (
    <div className="cms-container">
      <div className="cms-header">
        <h1>SEO Management</h1>
        <p>Manage SEO settings for website pages</p>
      </div>

      <div className="cms-page-list">
        <div className="cms-page-card">
          <div>
            <h4>Homepage SEO</h4>
            <small>Title, description, keywords</small>
          </div>
          <button className="cms-btn small">Edit</button>
        </div>

        <div className="cms-page-card">
          <div>
            <h4>Product Pages SEO</h4>
            <small>Dynamic product meta tags</small>
          </div>
          <button className="cms-btn small">Edit</button>
        </div>

        <div className="cms-page-card">
          <div>
            <h4>Static Pages SEO</h4>
            <small>About, Privacy, Terms</small>
          </div>
          <button className="cms-btn small">Edit</button>
        </div>
      </div>
    </div>
  );
}
